"use client";

import { Check, Loader2, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { UsernameSuggestions } from "@/components/onboarding/UsernameSuggestions";
import type { UsernamePickerState } from "@/hooks/useUsernamePicker";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/lib/auth/username";
import { cn } from "@/lib/utils";

const siteHost =
  typeof window !== "undefined"
    ? window.location.host
    : "agisna.dev";

type Props = {
  picker: UsernamePickerState;
  onSuccess?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  /** Settings panel vs full onboarding page */
  variant?: "onboarding" | "compact";
  /** Show AI-style username chips (onboarding only) */
  showSuggestions?: boolean;
};

export function UsernamePicker({
  picker,
  onSuccess,
  showSkip = false,
  onSkip,
  variant = "onboarding",
  showSuggestions = variant === "onboarding",
}: Props) {
  const {
    username,
    setUsername,
    checking,
    saving,
    available,
    code,
    message,
    canSave,
    save,
    previewPath,
  } = picker;

  const handleSave = async () => {
    const result = await save();
    if (result) onSuccess?.();
  };

  const statusTone =
    code === "ok" && available
      ? "success"
      : code && code !== "ok"
        ? "error"
        : "neutral";

  const compact = variant === "compact";

  return (
    <div className={cn("space-y-4", !compact && "space-y-6")}>
      {!compact && (
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600/90 dark:text-violet-300">
            Step 1 · Your identity
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Choose your public link
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This becomes your shareable profile — like{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              /frans
            </span>{" "}
            or{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              /agisna
            </span>
            . Lowercase only, unique, and yours to share.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Username
        </label>
        <div
          className={cn(
            "flex items-center gap-0 overflow-hidden rounded-2xl border bg-white/50 transition-shadow dark:bg-white/10",
            statusTone === "error"
              ? "border-rose-400/50 ring-2 ring-rose-500/20"
              : statusTone === "success"
                ? "border-emerald-400/40 ring-2 ring-emerald-500/15"
                : "border-white/30 focus-within:ring-2 focus-within:ring-violet-500/30",
          )}
        >
          <span className="shrink-0 pl-4 text-sm text-zinc-500">{siteHost}/</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="min-w-0 flex-1 bg-transparent py-3.5 pr-4 text-base font-semibold text-zinc-900 outline-none dark:text-white"
            placeholder="yourname"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={USERNAME_MAX_LENGTH}
            aria-invalid={statusTone === "error"}
            aria-describedby="username-hint username-feedback"
          />
          <span className="pr-3">
            {checking && (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-hidden />
            )}
            {!checking && statusTone === "success" && (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden />
            )}
            {!checking && statusTone === "error" && (
              <X className="h-4 w-4 text-rose-500" aria-hidden />
            )}
          </span>
        </div>

        <p id="username-hint" className="text-xs text-zinc-500">
          {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters · letters, numbers,
          hyphens · preview{" "}
          <span className="font-medium text-violet-600 dark:text-violet-400">
            {previewPath}
          </span>
        </p>

        {showSuggestions && (
          <UsernameSuggestions
            selected={username}
            onPick={(slug) => setUsername(slug)}
          />
        )}

        {message && (
          <motion.p
            id="username-feedback"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-sm font-medium",
              statusTone === "error"
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
            role="status"
          >
            {message}
          </motion.p>
        )}
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={() => void handleSave()}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition",
          "bg-violet-600 shadow-lg shadow-violet-500/25 hover:bg-violet-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {compact ? "Update link" : "Claim my link"}
      </button>

      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-xs text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          I&apos;ll do this later
        </button>
      )}
    </div>
  );
}
