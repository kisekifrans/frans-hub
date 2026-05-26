"use client";

import { useOptionalSession } from "@/components/providers/SessionProvider";

export type ProfileAuthState = "loading" | "guest" | "owner" | "member";

export function useProfileAuth(viewedSlug?: string) {
  const session = useOptionalSession();

  let authState: ProfileAuthState = "loading";
  if (!session || session.loading) {
    authState = "loading";
  } else if (!session.authenticated) {
    authState = "guest";
  } else {
    const ownSlug = session.profile?.slug?.toLowerCase();
    const viewing = viewedSlug?.toLowerCase();
    authState =
      viewing && ownSlug && ownSlug === viewing ? "owner" : "member";
  }

  return {
    authState,
    isOwner: authState === "owner",
    isGuest: authState === "guest",
    isMember: authState === "member",
    isLoading: authState === "loading",
  };
}
