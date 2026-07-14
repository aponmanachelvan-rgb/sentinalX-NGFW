import type { TrafficLog } from "@/lib/types";

export function trafficLogsToCsv(rows: TrafficLog[]) {
  const headers = ["id", "timestamp", "source_ip", "dest_port", "protocol", "action_taken"];
  const body = rows.map((row) =>
    [
      row.id,
      row.ts,
      row.source_ip,
      row.dest_port,
      row.protocol,
      row.action_taken,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...body].join("\n");
}
