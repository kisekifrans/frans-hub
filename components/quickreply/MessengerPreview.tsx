"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkifyText } from "@/components/quickreply/LinkifyText";
import { cn } from "@/lib/utils";

interface MessengerPreviewProps {
  text: string;
  className?: string;
}

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessengerPreview({ text, className }: MessengerPreviewProps) {
  const time = formatTime();
  const empty = !text.trim();

  return (
    <GlassCard
      padding="none"
      className={cn("signature-glow overflow-hidden", className)}
    >
      <motion.div className="border-b border-white/20 bg-[#0084ff]/90 px-4 py-3 dark:bg-[#0084ff]/80">
        <p className="text-sm font-semibold text-white">Pratinjau Messenger</p>
        <p className="text-[11px] text-white/80">Bubble keluar (pesan Anda)</p>
      </motion.div>

      <div className="min-h-[280px] bg-gradient-to-b from-zinc-100/90 to-zinc-200/60 p-4 dark:from-zinc-900/80 dark:to-zinc-950/60">
        <div className="mb-3 flex justify-center">
          <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-[10px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
            Hari ini · {time}
          </span>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[92%] sm:max-w-[85%]">
            <div
              className={cn(
                "rounded-[18px] rounded-br-[4px] bg-[#0084ff] px-3.5 py-2.5 text-[15px] leading-relaxed text-white shadow-md",
                "shadow-[#0084ff]/20",
              )}
            >
              {empty ? (
                <p className="text-sm text-white/70 italic">
                  Ketik pesan untuk melihat pratinjau…
                </p>
              ) : (
                <p className="whitespace-pre-wrap break-words [&_a]:text-white [&_a]:underline">
                  <LinkifyText text={text} />
                </p>
              )}
            </div>
            <p className="mt-1 text-right text-[10px] text-zinc-500">Dikirim · {time}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
