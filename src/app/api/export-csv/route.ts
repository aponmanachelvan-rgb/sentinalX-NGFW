import { trafficLogsToCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";
import type { TrafficLog } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("traffic_logs")
    .select("*")
    .order("ts", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = trafficLogsToCsv((data ?? []) as TrafficLog[]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sentinelx-traffic.csv"',
    },
  });
}
