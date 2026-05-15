"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface LazyEmbedProps {
  children: React.ReactNode;
  className?: string;
}

export function LazyEmbed({ children, className }: LazyEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "80px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {inView ? (
        children
      ) : (
        <div className="glass-card h-48 w-full animate-pulse rounded-2xl" />
      )}
    </motion.div>
  );
}
