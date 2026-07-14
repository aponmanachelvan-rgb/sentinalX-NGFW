"use client";

import { createClient } from "@/lib/supabase/client";
import type { BlockedIp, TrafficLog } from "@/lib/types";
import { Activity, Ban, CheckCircle2, Clock3, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Metrics = {
  allowed24h: number;
  blocked24h: number;
  blockedIps: number;
  lastMinute: number;
};

const defaultMetrics: Metrics = {
  allowed24h: 0,
  blocked24h: 0,
  blockedIps: 0,
  lastMinute: 0,
};

export function DashboardClient() {
  const supabase = useMemo(() => createClient(), []);
  const [traffic, setTraffic] = useState<TrafficLog[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const [recent, allowed, blocked, blockedIpRows, recentMinute] = await Promise.all([
      supabase
        .from("traffic_logs")
        .select("*")
        .order("ts", { ascending: false })
        .limit(120),
      supabase
        .from("traffic_logs")
        .select("id", { count: "exact", head: true })
        .eq("action_taken", "allowed")
        .gte("ts", dayAgo),
      supabase
        .from("traffic_logs")
        .select("id", { count: "exact", head: true })
        .eq("action_taken", "blocked")
        .gte("ts", dayAgo),
      supabase.from("blocked_ips").select("*").eq("status", "blocked"),
      supabase
        .from("traffic_logs")
        .select("id", { count: "exact", head: true })
        .gte("ts", minuteAgo),
    ]);

    if (recent.error || allowed.error || blocked.error || blockedIpRows.error || recentMinute.error) {
      throw new Error(
        recent.error?.message ??
          allowed.error?.message ??
          blocked.error?.message ??
          blockedIpRows.error?.message ??
          recentMinute.error?.message,
      );
    }

    setTraffic((recent.data ?? []) as TrafficLog[]);
    setBlockedIps((blockedIpRows.data ?? []) as BlockedIp[]);
    setMetrics({
      allowed24h: allowed.count ?? 0,
      blocked24h: blocked.count ?? 0,
      blockedIps: blockedIpRows.data?.length ?? 0,
      lastMinute: recentMinute.count ?? 0,
    });
  }, [supabase]);

  useEffect(() => {
    loadData()
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setLoading(false));

    const channel = supabase
      .channel("traffic-log-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "traffic_logs" },
        (payload) => {
          const next = payload.new as TrafficLog;
          setTraffic((current) => [next, ...current].slice(0, 120));
          setMetrics((current) => ({
            ...current,
            allowed24h: current.allowed24h + (next.action_taken === "allowed" ? 1 : 0),
            blocked24h: current.blocked24h + (next.action_taken === "blocked" ? 1 : 0),
            lastMinute: current.lastMinute + 1,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, supabase]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { minute: string; allowed: number; blocked: number }>();
    const since = Date.now() - 15 * 60 * 1000;

    for (const row of traffic) {
      const time = new Date(row.ts);
      if (time.getTime() < since) continue;
      const minute = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const bucket = buckets.get(minute) ?? { minute, allowed: 0, blocked: 0 };
      bucket[row.action_taken] += 1;
      buckets.set(minute, bucket);
    }

    return Array.from(buckets.values()).reverse();
  }, [traffic]);

  const cards = [
    { label: "Allowed 24h", value: metrics.allowed24h, icon: CheckCircle2 },
    { label: "Blocked 24h", value: metrics.blocked24h, icon: Ban },
    { label: "Blocked IPs", value: metrics.blockedIps, icon: Activity },
    { label: "Last minute", value: metrics.lastMinute, icon: Clock3 },
  ];

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading live telemetry
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Live Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Live traffic from your home network is evaluated through the rule engine and detection flow.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <Icon size={18} className="text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Allowed vs Blocked</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8dee8" />
                <XAxis dataKey="minute" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="allowed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Active Blocks</h2>
          {blockedIps.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No IPs are currently blocked.
            </p>
          ) : (
            <div className="space-y-3">
              {blockedIps.slice(0, 8).map((ip) => (
                <div key={ip.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-950">
                  <div className="font-mono font-medium">{ip.ip}</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {ip.reason ?? "Manual block"} · {ip.attempts} attempts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Home Network Connector</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Send traffic events from your router, gateway, or a collector script to the API endpoint below to populate the live dashboard.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Realtime ingestion ready
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="font-medium">POST /api/home-traffic</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-600 dark:text-slate-300">
{`{"source_ip":"192.168.1.55","dest_port":443,"protocol":"TCP"}`}
          </pre>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Use this endpoint from a home router export, a Raspberry Pi collector, OpenWRT logging, or a local script that can observe traffic on your network.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold">Recent Traffic</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Protocol</th>
                <th className="px-4 py-3">Security</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {traffic.slice(0, 20).map((row) => {
                const isInsecure = row.dest_port === 80 || row.dest_port === 23 || row.dest_port === 21;
                const isSecure = row.dest_port === 443;
                
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 dark:border-slate-800 transition-colors ${
                      isInsecure
                        ? "bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(row.ts.endsWith("Z") ? row.ts : row.ts + "Z").toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono">{row.source_ip}</td>
                    <td className="px-4 py-3 font-mono">{row.dest_port}</td>
                    <td className="px-4 py-3">{row.protocol}</td>
                    <td className="px-4 py-3">
                      {isInsecure ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 animate-pulse">
                          <ShieldAlert size={12} className="text-amber-500" /> Insecure (Cleartext)
                        </span>
                      ) : isSecure ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <ShieldCheck size={12} className="text-emerald-500" /> Secure (HTTPS)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          row.action_taken === "allowed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200"
                        }`}
                      >
                        {row.action_taken}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {traffic.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No traffic yet. Run the Supabase scheduled function to generate packets.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
