"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GearCard } from "@/components/gear/GearCard";
import type { GearCategoryGroup } from "@/lib/gear/types";
import { cn } from "@/lib/utils";

interface GearCategorySectionProps {
  group: GearCategoryGroup;
  defaultOpen?: boolean;
}

export function GearCategorySection({
  group,
  defaultOpen = true,
}: GearCategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { category, items } = group;
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass-card mb-4 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/50 dark:hover:bg-white/8"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white sm:text-lg">
            {category.name}
          </h2>
          <p className="text-xs text-zinc-500">{items.length} item</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-zinc-400 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <GearCard item={item} />
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
