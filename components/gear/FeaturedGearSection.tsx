"use client";

import { motion } from "framer-motion";
import { GearCard } from "@/components/gear/GearCard";
import { stagger, blockItemVariants } from "@/components/ui/motion";
import type { GearItem } from "@/lib/gear/types";

interface FeaturedGearSectionProps {
  items: GearItem[];
}

export function FeaturedGearSection({ items }: FeaturedGearSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl">
            Featured Gear
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Pilihan utama dari setup saya
          </p>
        </div>
      </div>
      <motion.ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {items.map((item, i) => (
          <motion.li key={item.id} variants={blockItemVariants}>
            <GearCard item={item} featured priority={i < 2} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
