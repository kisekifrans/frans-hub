"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils";

type Mode = "password" | "magic";

const errorMessages: Record<string, string> = {
  unauthorized:
    "Access denied. Only the authorized admin account can use this panel.",
  auth: "Sign-in failed. Please try again.",
  config: "Authentication is not configured. Check your environment variables.",
  magic: "Check your email for the sign-in link.",
};

interface LoginFormProps {
  error?: string;
  next?: string;
}

export function LoginForm({ error, next = "/admin" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<string | null>(
    error ? (errorMessages[error] ?? "Something went wrong.") : null,
  );
  const [success, setSuccess] = useState(error === "magic");

  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`;

  const signInWithGoogle = async () => {
    setLoading("google");
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
        },
      });
      if (authError) setMessage(authError.message);
    } catch {
      setMessage(errorMessages.config);
    } finally {
      setLoading(null);
    }
  };

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setMessage(null);
    setSuccess(false);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setMessage(authError.message);
        return;
      }
      const verify = await fetch("/api/auth/verify");
      if (!verify.ok) {
        setMessage(errorMessages.unauthorized);
        return;
      }
      window.location.href = next;
    } catch {
      setMessage(errorMessages.config);
    } finally {
      setLoading(null);
    }
  };

  const signInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setMessage(null);
    setSuccess(false);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (authError) {
        setMessage(authError.message);
        return;
      }
      setSuccess(true);
      setMessage("Magic link sent! Check your inbox to continue.");
    } catch {
      setMessage(errorMessages.config);
    } finally {
      setLoading(null);
    }
  };

  return (
    <PageShell className="flex flex-col" contentClassName="relative flex min-h-screen flex-col">
      <header className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300"
          >
            Affiliate Hub
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Authorized administrators only
          </p>
        </div>

        <GlassCard padding="lg" className="w-full max-w-md space-y-6">
          {message && (
            <p
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                success
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
              )}
              role="alert"
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/30 bg-white/60 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-white/80 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            {loading === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/30 dark:bg-white/10" />
            <span className="text-xs text-zinc-500">or email</span>
            <span className="h-px flex-1 bg-white/30 dark:bg-white/10" />
          </div>

          <div className="flex rounded-full bg-white/30 p-1 dark:bg-white/10">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-medium transition",
                mode === "password"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-600 dark:text-zinc-300",
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-medium transition",
                mode === "magic"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-600 dark:text-zinc-300",
              )}
            >
              Magic link
            </button>
          </div>

          <form
            onSubmit={mode === "password" ? signInWithPassword : signInWithMagicLink}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Email
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/20 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
                />
              </div>
            </label>

            {mode === "password" && (
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Password
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/20 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 disabled:opacity-60"
            >
              {loading === "email" && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "password" ? "Sign in with email" : "Send magic link"}
            </button>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
            Back to public hub
          </Link>
        </p>
      </main>
    </PageShell>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
