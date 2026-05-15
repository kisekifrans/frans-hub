"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HpBarProps {
  label: string;
  current: number;
  max: number;
  variant: "boss" | "player";
}

export function HpBar({ label, current, max, variant }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  const header = "mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-zinc-500";
  const track = "h-2.5 overflow-hidden rounded-full border border-white/25 bg-black/10 dark:bg-black/30";

  return (
    <motion.div layout className="w-full">
      <motion.div className={header}>
        <span>{label}</span>
        <span className="tabular-nums">
          {current}/{max}
        </span>
      </motion.div>
      <motion.div className={track}>
        <motion.div
          className={cn(
            "h-full rounded-full",
            variant === "boss"
              ? "bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-400",
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      </motion.div>
    </motion.div>
  );
}
