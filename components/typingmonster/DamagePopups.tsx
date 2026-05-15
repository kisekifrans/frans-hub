"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DamagePopup } from "@/lib/typingmonster/types";
import { cn } from "@/lib/utils";

export function DamagePopups({ popups }: { popups: DamagePopup[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: -28, scale: p.crit ? 1.35 : 1 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute font-mono text-sm font-bold tabular-nums drop-shadow-md sm:text-base",
              p.crit && "text-amber-300",
              !p.crit && !p.heal && "text-rose-400",
              p.heal && "text-emerald-400",
            )}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
