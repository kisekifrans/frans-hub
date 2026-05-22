"use client";

import { useEffect, useState } from "react";

export type ProfileAuthState = "loading" | "guest" | "owner" | "member";

export function useProfileAuth(viewedSlug?: string) {
  const [authState, setAuthState] = useState<ProfileAuthState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data?.authenticated) {
          setAuthState("guest");
          return;
        }
        const ownSlug = data.profile?.slug?.toLowerCase();
        const viewing = viewedSlug?.toLowerCase();
        if (viewing && ownSlug && ownSlug === viewing) {
          setAuthState("owner");
        } else {
          setAuthState("member");
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState("guest");
      });
    return () => {
      cancelled = true;
    };
  }, [viewedSlug]);

  return {
    authState,
    isOwner: authState === "owner",
    isGuest: authState === "guest",
    isMember: authState === "member",
    isLoading: authState === "loading",
  };
}
