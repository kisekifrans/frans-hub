"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type MemberAreaLinkProps = {
  next?: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

/** Login when signed out; member destination when signed in (non-localized routes). */
export function MemberAreaLink({
  next = "/dashboard",
  className,
  "aria-label": ariaLabel,
  children,
}: MemberAreaLinkProps) {
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const [href, setHref] = useState(loginHref);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.authenticated) {
          setHref(next);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [next]);

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
