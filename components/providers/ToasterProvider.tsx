"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "glass-card !bg-white/80 dark:!bg-zinc-900/80 !border-white/20 !text-zinc-900 dark:!text-white",
        },
      }}
    />
  );
}
