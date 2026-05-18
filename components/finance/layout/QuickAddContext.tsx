"use client";

import { createContext, useContext, useState } from "react";

const QuickAddContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <QuickAddContext.Provider value={{ open, setOpen }}>
      {children}
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd requires QuickAddProvider");
  return ctx;
}
