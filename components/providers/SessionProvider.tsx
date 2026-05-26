"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type SessionUser = {
  id: string;
  email: string | null;
};

export type SessionProfile = {
  id: string;
  slug: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  slugChangedAt: string | null;
};

export type SessionState = {
  loading: boolean;
  authenticated: boolean;
  user: SessionUser | null;
  profile: SessionProfile | null;
  isSiteAdmin: boolean;
  needsUsernameOnboarding: boolean;
};

type SessionContextValue = SessionState & {
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const INITIAL_STATE: SessionState = {
  loading: true,
  authenticated: false,
  user: null,
  profile: null,
  isSiteAdmin: false,
  needsUsernameOnboarding: false,
};

type SessionResponse = {
  authenticated?: boolean;
  needsUsernameOnboarding?: boolean;
  isSiteAdmin?: boolean;
  user?: SessionUser | null;
  profile?: {
    id: string;
    slug: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    slugChangedAt?: string | null;
  } | null;
};

/**
 * Mounted once at the root so dashboard/finance/profile pages can read auth
 * state without each component re-fetching /api/auth/session.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(INITIAL_STATE);
  const inflightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current;
    const promise = (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) {
          setState({
            ...INITIAL_STATE,
            loading: false,
            authenticated: false,
          });
          return;
        }
        const data = (await res.json()) as SessionResponse;
        setState({
          loading: false,
          authenticated: Boolean(data.authenticated),
          user: data.user ?? null,
          profile: data.profile
            ? {
                id: data.profile.id,
                slug: data.profile.slug,
                username: data.profile.username,
                displayName: data.profile.displayName,
                avatarUrl: data.profile.avatarUrl ?? null,
                slugChangedAt: data.profile.slugChangedAt ?? null,
              }
            : null,
          isSiteAdmin: Boolean(data.isSiteAdmin),
          needsUsernameOnboarding: Boolean(data.needsUsernameOnboarding),
        });
      } catch {
        setState({
          ...INITIAL_STATE,
          loading: false,
        });
      } finally {
        inflightRef.current = null;
      }
    })();
    inflightRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, refresh }),
    [state, refresh],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return ctx;
}

/** Safe variant for places that may render outside the provider (legacy). */
export function useOptionalSession(): SessionContextValue | null {
  return useContext(SessionContext);
}
