"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/ui/motion";

interface ProfileShareBarProps {
  username: string;
}

export function ProfileShareBar({ username }: ProfileShareBarProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const hubUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/`
      : `https://${username}.hub`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(hubUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const onShareClick = () => setOpen((v) => !v);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-5 flex justify-center"
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={onShareClick}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "glass-card flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300",
            "hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-md hover:shadow-violet-500/15",
            "dark:hover:bg-white/15",
            open && "ring-2 ring-violet-500/40",
          )}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          Share profile
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-label="Share profile"
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="glass-card absolute left-1/2 z-20 mt-2 w-[min(100vw-2rem,240px)] -translate-x-1/2 rounded-2xl border p-3 shadow-xl shadow-violet-500/10"
            >
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white/40 dark:hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>

              <div className="mt-3 flex flex-col items-center border-t border-white/15 pt-3">
                <QRCodeSVG
                  value={hubUrl}
                  size={128}
                  className="h-auto w-[128px]"
                  bgColor="transparent"
                  fgColor="currentColor"
                />
                <p className="mt-2 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                  Scan to open hub
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionDiv>
  );
}
