import type { FirewallRule, Protocol, TrafficAction } from "@/lib/types";

export type HomeTrafficEvent = {
  source_ip: string;
  dest_port: number;
  protocol: Protocol;
  ts?: string;
};

function ruleMatches(packet: HomeTrafficEvent, rule: FirewallRule) {
  const sourceMatches = !rule.source_ip || rule.source_ip === packet.source_ip;
  const portMatches = !rule.port || rule.port === packet.dest_port;
  const protocolMatches = !rule.protocol || rule.protocol === packet.protocol;

  return sourceMatches && portMatches && protocolMatches;
}

export function evaluateTrafficEvent(packet: HomeTrafficEvent, rules: FirewallRule[]): TrafficAction {
  const matchingRule = rules.find((rule) => rule.enabled && ruleMatches(packet, rule));

  if (!matchingRule) return "allowed";
  return matchingRule.action === "block" ? "blocked" : "allowed";
}

export function normalizeTrafficEvent(input: unknown): HomeTrafficEvent | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  const sourceIp = typeof candidate.source_ip === "string" ? candidate.source_ip.trim() : "";
  const destPort = Number(candidate.dest_port);
  const protocolValue = typeof candidate.protocol === "string" ? candidate.protocol.toUpperCase() : "";

  if (!sourceIp || !Number.isInteger(destPort) || destPort < 1 || destPort > 65535) {
    return null;
  }

  if (!(["TCP", "UDP", "ICMP"] as Protocol[]).includes(protocolValue as Protocol)) {
    return null;
  }

  return {
    source_ip: sourceIp,
    dest_port: destPort,
    protocol: protocolValue as Protocol,
    ts: typeof candidate.ts === "string" ? candidate.ts : undefined,
  };
}
