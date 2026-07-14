import { normalizeTrafficEvent, evaluateTrafficEvent } from "@/lib/attack-engine";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  const body = await request.json().catch(() => null);
  const event = normalizeTrafficEvent(body);

  if (!event) {
    return NextResponse.json({ error: "Invalid traffic event" }, { status: 400 });
  }

  const { data: rules, error: rulesError } = await supabase
    .from("rules")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: true });

  if (rulesError) {
    return NextResponse.json({ error: rulesError.message }, { status: 500 });
  }

  const action_taken = evaluateTrafficEvent(event, (rules ?? []) as any);
  const payload = {
    source_ip: event.source_ip,
    dest_port: event.dest_port,
    protocol: event.protocol,
    action_taken,
    ts: event.ts ?? new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("traffic_logs").insert(payload);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    const since = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentTraffic, error: recentError } = await supabase
      .from("traffic_logs")
      .select("dest_port")
      .eq("source_ip", payload.source_ip)
      .gte("ts", since);

    if (!recentError) {
      const distinctPorts = new Set((recentTraffic ?? []).map((row) => row.dest_port));

      if (distinctPorts.size >= 8) {
        const { data: existingBlock } = await supabase
          .from("blocked_ips")
          .select("attempts")
          .eq("ip", payload.source_ip)
          .maybeSingle();

        await supabase.from("blocked_ips").upsert(
          {
            ip: payload.source_ip,
            reason: "Suspicious traffic pattern detected",
            attempts: (existingBlock?.attempts ?? 0) + 1,
            status: "blocked",
          },
          { onConflict: "ip" },
        );

        const { data: existingRule } = await supabase
          .from("rules")
          .select("id")
          .eq("source_ip", payload.source_ip)
          .eq("action", "block")
          .maybeSingle();

        if (!existingRule) {
          await supabase.from("rules").insert({
            source_ip: payload.source_ip,
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
    }
  } catch {
    // Detection failures should not block the intake flow.
  }

  return NextResponse.json({ ok: true, action_taken: action_taken, payload });
}
