"use client";

import { createClient } from "@/lib/supabase/client";
import { isValidIpv4OrCidr } from "@/lib/network";
import type { FirewallRule, Protocol, RuleAction } from "@/lib/types";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

export function RulesClient() {
  const supabase = useMemo(() => createClient(), []);
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [sourceIp, setSourceIp] = useState("");
  const [port, setPort] = useState("");
  const [protocol, setProtocol] = useState<Protocol>("TCP");
  const [action, setAction] = useState<RuleAction>("block");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadRules = useCallback(async () => {
    const { data, error } = await supabase
      .from("rules")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    setRules((data ?? []) as FirewallRule[]);
  }, [supabase]);

  useEffect(() => {
    loadRules()
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [loadRules]);

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (sourceIp.trim() && !isValidIpv4OrCidr(sourceIp.trim())) {
      setMessage("Enter a valid IPv4 address or CIDR range, or leave source IP empty for wildcard.");
      return;
    }

    const parsedPort = Number(port);
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      setMessage("Port must be a whole number from 1 to 65535.");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("rules").insert({
      source_ip: sourceIp.trim() || null,
      port: parsedPort,
      protocol,
      action,
      enabled: true,
      created_by: user?.id,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSourceIp("");
    setPort("");
    await loadRules();
  }

  async function toggleRule(rule: FirewallRule) {
    const { error } = await supabase
      .from("rules")
      .update({ enabled: !rule.enabled })
      .eq("id", rule.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRules((current) =>
      current.map((item) =>
        item.id === rule.id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  }

  async function deleteRule(rule: FirewallRule) {
    const { error } = await supabase.from("rules").delete().eq("id", rule.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRules((current) => current.filter((item) => item.id !== rule.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Firewall Rules</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Rules are evaluated in creation order. Use a single IP or CIDR range such as 192.168.1.0/24 for home-network devices.
        </p>
      </div>

      <form
        onSubmit={createRule}
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_140px_140px_140px_auto]"
      >
        <label className="block">
          <span className="text-sm font-medium">Source IP or CIDR</span>
          <input
            value={sourceIp}
            onChange={(event) => setSourceIp(event.target.value)}
            placeholder="Any or 192.168.1.0/24"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Port</span>
          <input
            required
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(event) => setPort(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Protocol</span>
          <select
            value={protocol}
            onChange={(event) => setProtocol(event.target.value as Protocol)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option>TCP</option>
            <option>UDP</option>
            <option>ICMP</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Action</span>
          <select
            value={action}
            onChange={(event) => setAction(event.target.value as RuleAction)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="allow">allow</option>
            <option value="block">block</option>
          </select>
        </label>
        <button
          disabled={saving}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          Add
        </button>
      </form>

      {message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {message}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Protocol</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Enabled</th>
                <th className="px-4 py-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading rules
                  </td>
                </tr>
              ) : null}
              {!loading && rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No rules yet. Add one above to shape traffic decisions.
                  </td>
                </tr>
              ) : null}
              {rules.map((rule) => (
                <tr key={rule.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono">{rule.source_ip ?? "*"}</td>
                  <td className="px-4 py-3">{rule.port ?? "*"}</td>
                  <td className="px-4 py-3">{rule.protocol ?? "*"}</td>
                  <td className="px-4 py-3">{rule.action}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleRule(rule)}
                      className={`h-7 w-12 rounded-full p-1 transition ${
                        rule.enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={rule.enabled ? "Disable rule" : "Enable rule"}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white transition ${
                          rule.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteRule(rule)}
                      title="Delete rule"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 size={16} />
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
