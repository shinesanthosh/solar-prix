"use client";

interface Props {
  label: string;
  value: number;
  unit: string;
  color: string;
  prevValue?: number;
}

export default function MetricRow({ label, value, unit, color, prevValue }: Props) {
  const isNegative = value < 0;
  const trend =
    prevValue === undefined
      ? null
      : value > prevValue
      ? "up"
      : value < prevValue
      ? "down"
      : null;

  const formatted =
    Math.abs(value) >= 1000
      ? value.toFixed(0)
      : Math.abs(value) >= 100
      ? value.toFixed(1)
      : value.toFixed(2);

  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span
        className="text-xs tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", minWidth: 70 }}
      >
        {label}
      </span>

      <div className="flex items-center gap-2">
        {/* Trend arrow */}
        {trend && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            {trend === "up" ? (
              <path d="M5 1 L9 8 L1 8 Z" fill={isNegative ? "#EF4444" : color} opacity={0.8} />
            ) : (
              <path d="M5 9 L9 2 L1 2 Z" fill={isNegative ? "#10B981" : "rgba(255,255,255,0.3)"} opacity={0.8} />
            )}
          </svg>
        )}

        <span
          className="font-mono text-sm font-bold metric-value"
          style={{ color: isNegative ? "#EF4444" : "rgba(255,255,255,0.9)" }}
        >
          {formatted}
        </span>
        <span
          className="font-mono text-xs"
          style={{ color: "rgba(255,255,255,0.3)", minWidth: 30 }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}
