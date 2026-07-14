export type Protocol = "TCP" | "UDP" | "ICMP";
export type RuleAction = "allow" | "block";
export type TrafficAction = "allowed" | "blocked";

export type FirewallRule = {
  id: string;
  source_ip: string | null;
  port: number | null;
  protocol: Protocol | null;
  action: RuleAction;
  enabled: boolean;
  created_at: string;
  created_by: string | null;
};

export type TrafficLog = {
  id: number;
  ts: string;
  source_ip: string;
  dest_port: number;
  protocol: Protocol;
  action_taken: TrafficAction;
};

export type BlockedIp = {
  id: string;
  ip: string;
  reason: string | null;
  attempts: number;
  status: "blocked" | "unblocked";
  created_at: string;
};
