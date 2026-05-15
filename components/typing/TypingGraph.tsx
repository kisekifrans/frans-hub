"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { useClientMounted } from "@/hooks/useClientMounted";
import type { WpmSnapshot } from "@/lib/typing/types";

interface TypingGraphProps {
  data: WpmSnapshot[];
}

function TypingGraphInner({ data }: TypingGraphProps) {
  const mounted = useClientMounted();

  if (!mounted || data.length < 2) return null;

  return (
    <GlassCard padding="sm" className="h-36 sm:h-40">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Live WPM
      </p>
      <div className="h-[calc(100%-1.25rem)] min-h-[100px] w-full min-w-0">
        <ResponsiveContainer width="100%" height={100} minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#e879f9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="second" hide />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [`${v} WPM`, "Speed"]}
              labelFormatter={(s) => `${s}s`}
            />
            <Area
              type="monotone"
              dataKey="wpm"
              stroke="#8b5cf6"
              fill="url(#wpmGrad)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export const TypingGraph = memo(TypingGraphInner);
