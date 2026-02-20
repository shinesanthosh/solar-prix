"use client";

import { DashboardData, ENTITY_CONFIG, EntityKey } from "@/lib/mockApi";

interface Props {
  data: DashboardData;
}

// SVG canvas dimensions
const SVG_W = 1000;
const N = 50;          // segment count
const GAP = 3;         // gap between segments px
const SEG_W = (SVG_W - (N - 1) * GAP) / N; // ≈ 19.94

// Vertical layout
const LABEL_Y   = 11;   // major tick label baseline
const MAJOR_Y1  = 15;   // major tick top
const MINOR_Y1  = 24;   // minor tick top
const TICK_Y2   = 35;   // all ticks bottom
const SEG_Y     = 38;   // segment top
const SEG_H     = 22;   // segment height
const SVG_H     = SEG_Y + SEG_H + 2;

// Segment i → left x
function segX(i: number) { return i * (SEG_W + GAP); }
// Center x of segment i
function segCX(i: number) { return segX(i) + SEG_W / 2; }

function segColor(litFrac: number, baseColor: string, negative: boolean): string {
  if (negative) return "#EF4444";
  if (litFrac > 0.85) return "#EF4444";
  if (litFrac > 0.65) return "#F59E0B";
  return baseColor;
}

function fmtLabel(v: number): string {
  return Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(1);
}

function SegmentBar({
  value, min, max, color, label, unit,
}: {
  value: number; min: number; max: number;
  color: string; label: string; unit: string;
}) {
  const isBipolar = min < 0;
  const range = max - min;
  const fraction   = Math.min(1, Math.max(0, (value - min) / range));
  const zeroFrac   = isBipolar ? -min / range : 0;
  const zeroIdx    = zeroFrac * N;   // float index where zero sits
  const valueIdx   = fraction * N;  // float index for current value
  const isNeg      = value < 0;
  const displayVal = value.toFixed(2);

  // Major tick every 10 segments (6 major ticks: 0,10,20,30,40,50)
  // Minor tick every 1 segment (51 ticks total, skip majors)
  const MAJOR_STEP = 10;

  // Build major tick positions with labels
  const majorTicks: { i: number; label: string }[] = [];
  for (let i = 0; i <= N; i += MAJOR_STEP) {
    const v = min + (i / N) * range;
    majorTicks.push({ i, label: fmtLabel(v) });
  }

  return (
    <div className="flex items-center gap-5">
      {/* Label */}
      <div className="flex flex-col items-end" style={{ minWidth: 72, flexShrink: 0 }}>
        <span className="text-xs font-black tracking-widest uppercase" style={{ color, letterSpacing: "0.18em" }}>
          {label}
        </span>
        <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
          {unit}
        </span>
      </div>

      {/* SVG bar */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height={SVG_H}
        style={{ flex: 1, display: "block", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        {/* ── Segments ── */}
        {Array.from({ length: N }).map((_, i) => {
          // Is this segment lit?
          let lit = false;
          let litFrac = 0;
          if (isBipolar) {
            if (!isNeg) { lit = i >= zeroIdx && i < valueIdx; litFrac = (i - zeroIdx) / (N - zeroIdx); }
            else        { lit = i < zeroIdx && i >= valueIdx; litFrac = (zeroIdx - i) / zeroIdx; }
          } else {
            lit = i < valueIdx;
            litFrac = i / N;
          }
          const col = lit ? segColor(litFrac, color, isNeg && isBipolar) : "rgba(255,255,255,0.04)";

          return (
            <rect
              key={i}
              x={segX(i)}
              y={SEG_Y}
              width={SEG_W}
              height={SEG_H}
              rx={2}
              fill={col}
              style={lit ? { filter: `drop-shadow(0 0 4px ${col}90)` } : undefined}
            />
          );
        })}

        {/* ── Minor ticks (every segment, skip majors) ── */}
        {Array.from({ length: N + 1 }).map((_, i) => {
          if (i % MAJOR_STEP === 0) return null; // major handles these
          const cx = i === N ? SVG_W : segCX(i);
          const isZeroTick = isBipolar && Math.abs(i - zeroIdx) < 0.6;
          return (
            <line
              key={`min-${i}`}
              x1={cx} y1={MINOR_Y1}
              x2={cx} y2={TICK_Y2}
              stroke={isZeroTick ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)"}
              strokeWidth={isZeroTick ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* ── Major ticks + labels ── */}
        {majorTicks.map(({ i, label: lbl }) => {
          const cx = i === N ? SVG_W - SEG_W / 2 : segCX(i);
          // Is this tick in the lit zone?
          let litHere = false;
          if (isBipolar) {
            if (!isNeg) litHere = i >= zeroIdx && i <= valueIdx;
            else        litHere = i <= zeroIdx && i >= valueIdx;
          } else {
            litHere = i <= valueIdx;
          }
          const tickColor = litHere ? color : "rgba(255,255,255,0.25)";
          const isZeroMajor = isBipolar && Math.abs(i - zeroIdx) < 0.6;

          return (
            <g key={`maj-${i}`}>
              <line
                x1={cx} y1={isZeroMajor ? MAJOR_Y1 - 6 : MAJOR_Y1}
                x2={cx} y2={TICK_Y2}
                stroke={isZeroMajor ? "rgba(255,255,255,0.6)" : tickColor}
                strokeWidth={isZeroMajor ? 2.5 : 2}
                strokeLinecap="round"
                style={litHere && !isZeroMajor ? { filter: `drop-shadow(0 0 3px ${tickColor})` } : undefined}
              />
              <text
                x={cx}
                y={LABEL_Y}
                textAnchor="middle"
                fontSize={10}
                fontFamily="monospace"
                fill={isZeroMajor ? "rgba(255,255,255,0.5)" : litHere ? color : "rgba(255,255,255,0.2)"}
                fontWeight={isZeroMajor ? "600" : "400"}
              >
                {lbl}
              </text>
            </g>
          );
        })}

        {/* ── Zero line for bipolar (if not landing on a major tick) ── */}
        {isBipolar && zeroIdx % MAJOR_STEP !== 0 && (
          (() => {
            const cx = segCX(Math.round(zeroIdx));
            return (
              <g>
                <line
                  x1={cx} y1={MAJOR_Y1 - 6}
                  x2={cx} y2={SEG_Y + SEG_H}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <text x={cx} y={LABEL_Y} textAnchor="middle" fontSize={10} fontFamily="monospace"
                  fill="rgba(255,255,255,0.45)" fontWeight="600">
                  0
                </text>
              </g>
            );
          })()
        )}
      </svg>

      {/* Value readout */}
      <div className="flex flex-col items-start" style={{ minWidth: 68, flexShrink: 0 }}>
        <span
          className="font-mono font-bold text-base"
          style={{ color: isNeg ? "#EF4444" : "rgba(255,255,255,0.9)", lineHeight: 1 }}
        >
          {displayVal}
        </span>
        <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
          {isNeg ? "▼" : "▲"} {Math.abs(((fraction - (isBipolar ? zeroFrac : 0)) / (isBipolar ? 0.5 : 1)) * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function PowerBalance({ data }: { data: DashboardData }) {
  const supply =
    Math.max(0, data.solar.power) +
    (data.battery.power < 0 ? Math.abs(data.battery.power) : 0) +
    (data.grid.power    < 0 ? Math.abs(data.grid.power)    : 0);
  const balance  = supply - data.load.power;
  const isExcess = balance >= 0;
  const arc      = Math.min(1, Math.abs(balance) / 5) * 188;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-4"
      style={{
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${isExcess ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        minWidth: 140,
        flexShrink: 0,
        boxShadow: isExcess ? "0 0 20px rgba(16,185,129,0.1)" : "0 0 20px rgba(239,68,68,0.1)",
      }}
    >
      <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>
        Balance
      </div>
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={40} cy={40} r={30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
          <circle
            cx={40} cy={40} r={30}
            fill="none"
            stroke={isExcess ? "#10B981" : "#EF4444"}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${arc} 188`}
            strokeDashoffset={47}
            style={{ filter: `drop-shadow(0 0 6px ${isExcess ? "#10B981" : "#EF4444"})`, transition: "stroke-dasharray 0.4s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono font-bold text-sm" style={{ color: isExcess ? "#10B981" : "#EF4444", lineHeight: 1 }}>
            {isExcess ? "+" : ""}{balance.toFixed(1)}
          </span>
          <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>kW</span>
        </div>
      </div>
      <div
        className="text-xs font-mono font-bold tracking-widest mt-2 px-3 py-0.5 rounded-full"
        style={{
          color: isExcess ? "#10B981" : "#EF4444",
          background: isExcess ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${isExcess ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          letterSpacing: "0.1em",
        }}
      >
        {isExcess ? "SURPLUS" : "DEFICIT"}
      </div>
    </div>
  );
}

export default function TachometerPanel({ data }: Props) {
  const entities: { key: EntityKey }[] = [
    { key: "solar" }, { key: "battery" }, { key: "load" }, { key: "grid" },
  ];

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, #EF4444, #F59E0B)" }} />
        <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>
          Power Gauges
        </span>
      </div>

      <div className="flex gap-6 items-center">
        <div className="flex-1 flex flex-col gap-5">
          {entities.map(({ key }) => {
            const cfg = ENTITY_CONFIG[key];
            const val = data[key].power;
            return (
              <SegmentBar
                key={key}
                value={val}
                min={cfg.ranges.power.min}
                max={cfg.ranges.power.max}
                color={cfg.color}
                label={cfg.label}
                unit="kW"
              />
            );
          })}
        </div>
        <PowerBalance data={data} />
      </div>
    </div>
  );
}
