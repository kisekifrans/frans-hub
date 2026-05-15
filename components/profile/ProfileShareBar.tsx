"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { MotionDiv } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface ProfileShareBarProps {
  username: string;
}

export function ProfileShareBar({ username }: ProfileShareBarProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const hubUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/`
      : `https://${username}.hub`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(hubUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={copyLink}
        className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/55 dark:hover:bg-white/15"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Copy hub link
      </button>
      <button
        type="button"
        onClick={() => setShowQr((s) => !s)}
        className={cn(
          "glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
          showQr && "ring-2 ring-violet-500/50",
        )}
      >
        <QrCode className="h-4 w-4" />
        QR code
      </button>
      {showQr && (
        <GlassCard padding="md" className="w-full max-w-[220px] p-4">
          <QRCodeSVG
            value={hubUrl}
            size={180}
            className="mx-auto h-auto w-full max-w-[180px]"
            bgColor="transparent"
            fgColor="currentColor"
          />
          <p className="mt-2 text-center text-xs text-zinc-500">Scan to open hub</p>
        </GlassCard>
      )}
    </MotionDiv>
  );
}
