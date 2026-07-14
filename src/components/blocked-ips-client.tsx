"use client";

import { createClient } from "@/lib/supabase/client";
import type { BlockedIp } from "@/lib/types";
import { Loader2, Unlock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function BlockedIpsClient() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<BlockedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workingIp, setWorkingIp] = useState("");

  const loadRows = useCallback(async () => {
    const { data, error } = await supabase
      .from("blocked_ips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setRows((data ?? []) as BlockedIp[]);
  }, [supabase]);

  useEffect(() => {
    loadRows()
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [loadRows]);

  async function unblock(row: BlockedIp) {
    setWorkingIp(row.ip);
    setMessage("");

    const [blockedUpdate, ruleUpdate] = await Promise.all([
      supabase.from("blocked_ips").update({ status: "unblocked" }).eq("id", row.id),
      supabase
        .from("rules")
        .update({ enabled: false })
        .eq("source_ip", row.ip)
        .eq("action", "block"),
    ]);

    setWorkingIp("");

    if (blockedUpdate.error || ruleUpdate.error) {
      setMessage(blockedUpdate.error?.message ?? ruleUpdate.error?.message ?? "Unblock failed.");
      return;
    }

    setRows((current) =>
      current.map((item) =>
        item.id === row.id ? { ...item, status: "unblocked" } : item,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blocked IPs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Detection can auto-block IPs after repeated distinct-port hits.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {message}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading blocked IPs
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No blocked IPs yet.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono">{row.ip}</td>
                  <td className="px-4 py-3">{row.reason ?? "Manual block"}</td>
                  <td className="px-4 py-3">{row.attempts}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={row.status === "unblocked" || workingIp === row.ip}
                      onClick={() => unblock(row)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {workingIp === row.ip ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Unlock size={16} />
                      )}
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
