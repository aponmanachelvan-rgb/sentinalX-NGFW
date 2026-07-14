"use client";

import { createClient } from "@/lib/supabase/client";
import { BarChart3, Download, ListX, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/rules", label: "Rules", icon: ShieldCheck },
  { href: "/blocked-ips", label: "Blocked IPs", icon: ListX },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
            <ShieldCheck size={19} />
          </span>
          <span>SentinelX NGFW</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <a
            href="/api/export-csv"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download size={16} />
            Export
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut size={16} />
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
