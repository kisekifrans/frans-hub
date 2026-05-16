"use client";

import dynamic from "next/dynamic";

const SignatureWorkspace = dynamic(
  () =>
    import("@/components/signature/SignatureWorkspace").then(
      (m) => m.SignatureWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        Loading signature studio…
      </div>
    ),
  },
);

export function SignaturePageClient() {
  return <SignatureWorkspace />;
}
