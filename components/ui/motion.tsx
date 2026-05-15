"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export function MotionDiv(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />;
}

export function MotionSection(props: HTMLMotionProps<"section">) {
  return <motion.section {...props} />;
}

export function MotionLi(props: HTMLMotionProps<"li">) {
  return <motion.li {...props} />;
}

export const blockItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 28 },
  },
};
