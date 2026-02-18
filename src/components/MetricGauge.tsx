"use client";

interface Props {
  value: number;
  min: number;
  max: number;
  color: string;
  label: string;
  unit: string;
  size?: number;
}

// Arc from -225° to 45°, spanning 270° clockwise
const START_DEG = -225;
const TOTAL_DEG = 270;

const toRad = (deg: number) => (deg * Math.PI) / 180;

function polarXY(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = toRad(angleDeg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromFrac: number, toFrac: number): string {
  if (Math.abs(toFrac - fromFrac) < 0.001) return "";
  const a1 = START_DEG + fromFrac * TOTAL_DEG;
  const a2 = START_DEG + toFrac * TOTAL_DEG;
  const p1 = polarXY(cx, cy, a1, r);
  const p2 = polarXY(cx, cy, a2, r);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
}

// Zone color based on fraction of range from start
function zoneColor(frac: number, baseColor: string, isNegative: boolean): string {
  if (isNegative) return "#EF4444";
  if (frac > 0.85) return "#EF4444";
  if (frac > 0.65) return "#F59E0B";
  return baseColor;
}

export default function MetricGauge({ value, min, max, color, label, unit, size = 140 }: Props) {
  const cx = size / 2;
  const cy = size / 2;

  const trackR   = size * 0.370;  // main arc
  const outerR   = size * 0.415;  // decorative outer ring
  const tickOutR = size * 0.400;  // major tick outer
  const tickInR  = size * 0.360;  // major tick inner
  const minTickOutR = size * 0.393; // minor tick outer
  const minTickInR  = size * 0.370; // minor tick inner
  const needleR  = size * 0.330;  // needle tip reaches here
  const hubR     = size * 0.055;  // center hub

  const strokeW  = size * 0.055;

  const range = max - min;
  const isBipolar = min < 0;
  const zeroFrac = isBipolar ? (-min / range) : 0;
  const valueFrac = Math.min(1, Math.max(0, (value - min) / range));
  const isNegative = value < 0;

  // --- Tick marks (21 minor = every ~4.76%, 11 major = every ~10%) ---
  const MAJOR = 11;
  const MINOR = 51; // total minor slots including major positions
  const ticks: { frac: number; isMajor: boolean }[] = [];
  for (let i = 0; i <= MINOR; i++) {
    const frac = i / MINOR;
    const isMajor = i % (MINOR / (MAJOR - 1)) === 0;
    ticks.push({ frac, isMajor });
  }

  // --- Zone arcs (split into small segments for color gradient effect) ---
  const ZONE_SEGS = 60;
  const zonePaths: { path: string; col: string }[] = [];
  for (let i = 0; i < ZONE_SEGS; i++) {
    const f0 = i / ZONE_SEGS;
    const f1 = (i + 1) / ZONE_SEGS;
    // Is this segment "active"?
    let active = false;
    if (isBipolar) {
      if (!isNegative) active = f0 >= zeroFrac && f0 < valueFrac;
      else             active = f0 >= valueFrac && f0 < zeroFrac;
    } else {
      active = f0 < valueFrac;
    }
    if (!active) continue;

    // color based on segment position
    const segFrac = isBipolar
      ? (isNegative ? (1 - f1 / zeroFrac) : ((f0 - zeroFrac) / (1 - zeroFrac)))
      : f0;
    const col = zoneColor(segFrac, color, isNegative && isBipolar);
    const path = arcPath(cx, cy, trackR, f0, f1);
    if (path) zonePaths.push({ path, col });
  }

  // --- Needle ---
  const needleAngleDeg = START_DEG + valueFrac * TOTAL_DEG;
  const needleTip  = polarXY(cx, cy, needleAngleDeg, needleR);
  const needleWide = polarXY(cx, cy, needleAngleDeg + 90, hubR * 0.55);
  const needleWide2 = polarXY(cx, cy, needleAngleDeg - 90, hubR * 0.55);
  const needleColor = isNegative ? "#EF4444" : color;

  // --- Zero tick for bipolar ---
  const zeroAngle = START_DEG + zeroFrac * TOTAL_DEG;
  const zTip   = polarXY(cx, cy, zeroAngle, tickOutR + size * 0.025);
  const zBase  = polarXY(cx, cy, zeroAngle, tickInR  - size * 0.015);

  // --- Display value ---
  const absV = Math.abs(value);
  const displayVal = absV >= 1000 ? value.toFixed(0)
    : absV >= 100  ? value.toFixed(1)
    : absV >= 10   ? value.toFixed(1)
    : value.toFixed(2);

  // --- Redline zone (last 15% of positive range) ---
  const redlinePath = arcPath(cx, cy, outerR, isBipolar ? (zeroFrac + (1 - zeroFrac) * 0.85) : 0.85, 1);

  return (
    <div className="flex flex-col items-center select-none" style={{ gap: 6 }}>
      <svg
        width={size}
        height={size * 0.88}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {/* Outer decorative ring (dim full arc) */}
        <path
          d={arcPath(cx, cy, outerR, 0, 1)}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={size * 0.012}
          strokeLinecap="butt"
        />

        {/* Redline zone on outer ring */}
        {redlinePath && (
          <path
            d={redlinePath}
            fill="none"
            stroke="#EF444440"
            strokeWidth={size * 0.018}
            strokeLinecap="butt"
            style={{ filter: "drop-shadow(0 0 3px #EF444460)" }}
          />
        )}

        {/* Background track */}
        <path
          d={arcPath(cx, cy, trackR, 0, 1)}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeW}
          strokeLinecap="butt"
        />

        {/* Active zone segments */}
        {zonePaths.map((z, i) => (
          <path
            key={i}
            d={z.path}
            fill="none"
            stroke={z.col}
            strokeWidth={strokeW + 0.5}
            strokeLinecap="butt"
            style={{ filter: `drop-shadow(0 0 4px ${z.col}80)` }}
          />
        ))}

        {/* Tick marks */}
        {ticks.map(({ frac, isMajor }, i) => {
          const angle = START_DEG + frac * TOTAL_DEG;
          const oR = isMajor ? tickOutR : minTickOutR;
          const iR = isMajor ? tickInR  : minTickInR;
          const p1 = polarXY(cx, cy, angle, oR);
          const p2 = polarXY(cx, cy, angle, iR);

          // color: lit if within active zone
          let lit = false;
          if (isBipolar) {
            lit = isNegative ? (frac >= valueFrac && frac <= zeroFrac) : (frac >= zeroFrac && frac <= valueFrac);
          } else {
            lit = frac <= valueFrac;
          }
          const segFrac = isBipolar
            ? (isNegative ? 1 - frac / zeroFrac : (frac - zeroFrac) / (1 - zeroFrac))
            : frac;
          const tc = lit ? zoneColor(segFrac, color, isNegative && isBipolar) : "rgba(255,255,255,0.12)";

          return (
            <line
              key={i}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={tc}
              strokeWidth={isMajor ? size * 0.012 : size * 0.006}
              strokeLinecap="round"
              style={lit ? { filter: `drop-shadow(0 0 3px ${tc})` } : undefined}
            />
          );
        })}

        {/* Zero line for bipolar */}
        {isBipolar && (
          <line
            x1={zTip.x} y1={zTip.y}
            x2={zBase.x} y2={zBase.y}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={size * 0.015}
            strokeLinecap="round"
          />
        )}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleWide.x},${needleWide.y} ${needleWide2.x},${needleWide2.y}`}
          fill={needleColor}
          style={{ filter: `drop-shadow(0 0 6px ${needleColor}cc)` }}
        />

        {/* Hub cap */}
        <circle cx={cx} cy={cy} r={hubR} fill="#1a1a1a" stroke={needleColor} strokeWidth={size * 0.012} />
        <circle cx={cx} cy={cy} r={hubR * 0.4} fill={needleColor} style={{ filter: `drop-shadow(0 0 4px ${needleColor})` }} />

        {/* Value */}
        <text
          x={cx}
          y={cy + size * 0.20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.175}
          fontWeight="800"
          fontFamily="monospace"
          fill={isNegative ? "#EF4444" : "rgba(255,255,255,0.92)"}
          style={{ letterSpacing: "-0.02em" }}
        >
          {displayVal}
        </text>
        <text
          x={cx}
          y={cy + size * 0.32}
          textAnchor="middle"
          fontSize={size * 0.085}
          fontFamily="monospace"
          fill="rgba(255,255,255,0.3)"
        >
          {unit}
        </text>

        {/* Min / max corner labels */}
        <text
          x={polarXY(cx, cy, START_DEG, outerR + size * 0.04).x}
          y={polarXY(cx, cy, START_DEG, outerR + size * 0.04).y + 2}
          textAnchor="middle"
          fontSize={size * 0.072}
          fontFamily="monospace"
          fill="rgba(255,255,255,0.2)"
        >
          {min}
        </text>
        <text
          x={polarXY(cx, cy, START_DEG + TOTAL_DEG, outerR + size * 0.04).x}
          y={polarXY(cx, cy, START_DEG + TOTAL_DEG, outerR + size * 0.04).y + 2}
          textAnchor="middle"
          fontSize={size * 0.072}
          fontFamily="monospace"
          fill="rgba(255,255,255,0.2)"
        >
          {max}
        </text>
      </svg>

      {/* Label below */}
      <div
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.22em" }}
      >
        {label}
      </div>
    </div>
  );
}
