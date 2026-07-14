import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Protocol = "TCP" | "UDP" | "ICMP";
type RuleAction = "allow" | "block";
type TrafficAction = "allowed" | "blocked";

type FirewallRule = {
  id: string;
  source_ip: string | null;
  port: number | null;
  protocol: Protocol | null;
  action: RuleAction;
  enabled: boolean;
  created_at: string;
};

type Packet = {
  source_ip: string;
  dest_port: number;
  protocol: Protocol;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const protocols: Protocol[] = ["TCP", "UDP", "ICMP"];
const commonPorts = [22, 53, 80, 123, 443, 445, 5432, 8080, 3389];

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomIp() {
  const privateRanges = [
    () => `10.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`,
    () => `172.${rand(16, 31)}.${rand(0, 255)}.${rand(1, 254)}`,
    () => `192.168.${rand(0, 255)}.${rand(1, 254)}`,
  ];
  const publicRange = () =>
    `${rand(23, 223)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;

  return Math.random() < 0.45 ? pick(privateRanges)() : publicRange();
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPort() {
  return Math.random() < 0.65 ? pick(commonPorts) : rand(1024, 65535);
}

function generatePackets() {
  // This simulates packets because serverless platforms cannot capture raw traffic.
  // The rule evaluation below is real logic over the simulated packet records.
  const packets: Packet[] = [];
  const shouldPortScan = Math.random() < 0.1;

  if (shouldPortScan) {
    const source_ip = randomIp();
    const count = rand(10, 16);
    for (let index = 0; index < count; index += 1) {
      packets.push({
        source_ip,
        dest_port: 20 + index * rand(3, 17),
        protocol: "TCP",
      });
    }
    return packets;
  }

  const count = rand(3, 8);
  for (let index = 0; index < count; index += 1) {
    packets.push({
      source_ip: randomIp(),
      dest_port: randomPort(),
      protocol: pick(protocols),
    });
  }

  return packets;
}

function ruleMatches(packet: Packet, rule: FirewallRule) {
  const sourceMatches = !rule.source_ip || rule.source_ip === packet.source_ip;
  const portMatches = !rule.port || rule.port === packet.dest_port;
  const protocolMatches = !rule.protocol || rule.protocol === packet.protocol;
  return sourceMatches && portMatches && protocolMatches;
}

function evaluatePacket(packet: Packet, rules: FirewallRule[]): TrafficAction {
  const matchingRule = rules.find((rule) => rule.enabled && ruleMatches(packet, rule));
  if (!matchingRule) return "allowed";
  return matchingRule.action === "block" ? "blocked" : "allowed";
}

async function detectPortScan(sourceIp: string) {
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("traffic_logs")
    .select("dest_port")
    .eq("source_ip", sourceIp)
    .gte("ts", since);

  if (error) throw error;

  const distinctPorts = new Set((data ?? []).map((row) => row.dest_port));
  if (distinctPorts.size <= 8) return;

  const { data: existing } = await supabase
    .from("blocked_ips")
    .select("attempts")
    .eq("ip", sourceIp)
    .maybeSingle();

  await supabase.from("blocked_ips").upsert(
    {
      ip: sourceIp,
      reason: "Port scan detected",
      attempts: (existing?.attempts ?? 0) + 1,
      status: "blocked",
    },
    { onConflict: "ip" },
  );

  const { data: existingRule } = await supabase
    .from("rules")
    .select("id")
    .eq("source_ip", sourceIp)
    .eq("action", "block")
    .maybeSingle();

  if (!existingRule) {
    await supabase.from("rules").insert({
      source_ip: sourceIp,
      port: null,
      protocol: null,
      action: "block",
      enabled: true,
      created_by: null,
    });
  } else {
    await supabase.from("rules").update({ enabled: true }).eq("id", existingRule.id);
  }
}

Deno.serve(async () => {
  try {
    const { data: rules, error: rulesError } = await supabase
      .from("rules")
      .select("*")
      .eq("enabled", true)
      .order("created_at", { ascending: true });

    if (rulesError) throw rulesError;

    const packets = generatePackets();
    const trafficRows = packets.map((packet) => ({
      source_ip: packet.source_ip,
      dest_port: packet.dest_port,
      protocol: packet.protocol,
      action_taken: evaluatePacket(packet, (rules ?? []) as FirewallRule[]),
    }));

    const { error: insertError } = await supabase.from("traffic_logs").insert(trafficRows);
    if (insertError) throw insertError;

    for (const sourceIp of new Set(packets.map((packet) => packet.source_ip))) {
      await detectPortScan(sourceIp);
    }

    return new Response(JSON.stringify({ inserted: trafficRows.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
