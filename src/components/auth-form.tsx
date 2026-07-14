"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm the account, then log in.");
      return;
    }

    router.replace(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <main className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white">
            <ShieldCheck size={21} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
              {mode === "login" ? "Log in" : "Create account"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              SentinelX simulated firewall dashboard
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </span>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          {message ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-100">
              {message}
            </p>
          ) : null}
          <button
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : null}
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
          {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
          <Link
            className="font-medium text-emerald-700 dark:text-emerald-300"
            href={mode === "login" ? "/signup" : "/login"}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </main>
    </div>
  );
}
