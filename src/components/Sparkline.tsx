"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { HistoryPoint, EntityKey } from "@/lib/mockApi";

interface Props {
  history: HistoryPoint[];
  entity: EntityKey;
  color: string;
  height?: number;
}

export default function Sparkline({ history, entity, color, height = 60 }: Props) {
  const data = history.map((h) => ({ v: h[entity] }));

  // Pad with zeros if not enough data
  const padded = data.length < 2
    ? [{ v: 0 }, { v: 0 }, ...data]
    : data;

  // Determine if we need negative Y support
  const hasNegative = padded.some((d) => d.v < 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={padded} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${entity}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {hasNegative && (
          <YAxis domain={["auto", "auto"]} hide />
        )}
        {!hasNegative && (
          <YAxis domain={[0, "auto"]} hide />
        )}
        <Tooltip
          contentStyle={{
            background: "#111",
            border: `1px solid ${color}40`,
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "monospace",
            color: "#fff",
          }}
          formatter={(v: number) => [v.toFixed(2), ""]}
          labelFormatter={() => ""}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${entity})`}
          dot={false}
          animationDuration={200}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
