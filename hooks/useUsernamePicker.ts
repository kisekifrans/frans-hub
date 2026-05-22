"use client";

import { useCallback, useEffect, useState } from "react";
import {
  sanitizeUsernameInput,
  USERNAME_MIN_LENGTH,
  type UsernameIssueCode,
} from "@/lib/auth/username";

export type UsernamePickerState = {
  username: string;
  setUsername: (value: string) => void;
  checking: boolean;
  saving: boolean;
  available: boolean | null;
  code: UsernameIssueCode | null;
  message: string | null;
  canSave: boolean;
  save: () => Promise<{ slug: string; publicUrl: string } | null>;
  previewPath: string;
};

type Options = {
  initialUsername?: string;
  currentUsername?: string;
  debounceMs?: number;
};

export function useUsernamePicker(options: Options = {}): UsernamePickerState {
  const {
    initialUsername = "",
    currentUsername,
    debounceMs = 400,
  } = options;

  const [username, setUsernameRaw] = useState(initialUsername);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [code, setCode] = useState<UsernameIssueCode | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const setUsername = useCallback((value: string) => {
    setUsernameRaw(sanitizeUsernameInput(value));
    setAvailable(null);
    setCode(null);
    setMessage(null);
  }, []);

  const check = useCallback(
    async (value: string) => {
      if (value.length < USERNAME_MIN_LENGTH) {
        setAvailable(null);
        setCode(value.length > 0 ? "too_short" : null);
        setMessage(
          value.length > 0 ? `Use at least ${USERNAME_MIN_LENGTH} characters.` : null,
        );
        return;
      }

      setChecking(true);
      try {
        const res = await fetch(
          `/api/profile/slug?slug=${encodeURIComponent(value)}`,
        );
        const data = (await res.json()) as {
          available?: boolean;
          code?: UsernameIssueCode;
          message?: string | null;
        };
        setAvailable(Boolean(data.available));
        setCode(data.code ?? null);
        setMessage(data.message ?? null);
      } catch {
        setAvailable(null);
        setCode(null);
        setMessage("Could not check availability. Try again.");
      } finally {
        setChecking(false);
      }
    },
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (username.length >= 1) void check(username);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [username, check, debounceMs]);

  const canSave =
    !saving &&
    !checking &&
    available === true &&
    code === "ok" &&
    username.length >= USERNAME_MIN_LENGTH &&
    username !== currentUsername;

  const save = useCallback(async () => {
    if (!canSave) return null;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/slug", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not save username");
        setCode(data.code ?? "taken");
        setAvailable(false);
        return null;
      }
      return {
        slug: data.slug as string,
        publicUrl: data.publicUrl as string,
      };
    } catch {
      setMessage("Something went wrong. Try again.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [canSave, username]);

  const previewPath = username.length >= USERNAME_MIN_LENGTH ? `/${username}` : "/…";

  return {
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
  };
}
