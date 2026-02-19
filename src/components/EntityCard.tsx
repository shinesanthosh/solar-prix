"use client";

import { EntityMetrics, HistoryPoint, ENTITY_CONFIG, EntityKey } from "@/lib/mockApi";
import MetricGauge from "./MetricGauge";
import Sparkline from "./Sparkline";

interface Props {
  entity: EntityKey;
  metrics: EntityMetrics;
  history: HistoryPoint[];
}

function getStateBadge(entity: EntityKey, metrics: EntityMetrics) {
  if (entity === "battery") {
    if (metrics.power < -0.05) return { label: "DISCHARGING", bg: "rgba(6,182,212,0.15)", text: "#06B6D4", border: "rgba(6,182,212,0.3)" };
    if (metrics.power > 0.05)  return { label: "CHARGING",    bg: "rgba(16,185,129,0.15)", text: "#10B981", border: "rgba(16,185,129,0.3)" };
    return                              { label: "IDLE",        bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" };
  }
  if (entity === "grid") {
    if (metrics.power < -0.05) return { label: "IMPORTING", bg: "rgba(239,68,68,0.15)",   text: "#EF4444", border: "rgba(239,68,68,0.3)" };
    if (metrics.power > 0.05)  return { label: "EXPORTING", bg: "rgba(16,185,129,0.15)", text: "#10B981", border: "rgba(16,185,129,0.3)" };
    return                              { label: "STANDBY",   bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" };
  }
  if (entity === "solar") {
    if (metrics.power > 6)  return { label: "PEAK",       bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" };
    if (metrics.power > 1)  return { label: "GENERATING", bg: "rgba(245,158,11,0.1)",  text: "#F59E0B", border: "rgba(245,158,11,0.2)" };
    return                           { label: "LOW",        bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" };
  }
  // load
  if (metrics.power > 4)  return { label: "HIGH",   bg: "rgba(239,68,68,0.15)",  text: "#EF4444", border: "rgba(239,68,68,0.3)" };
  if (metrics.power > 2)  return { label: "NORMAL", bg: "rgba(139,92,246,0.1)",  text: "#8B5CF6", border: "rgba(139,92,246,0.2)" };
  return                           { label: "LOW",    bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" };
}

export default function EntityCard({ entity, metrics, history }: Props) {
  const config = ENTITY_CONFIG[entity];
  const badge = getStateBadge(entity, metrics);
  const { ranges } = config;

  let borderColor = "rgba(255,255,255,0.07)";
  if (entity === "battery" && metrics.power < -0.05) borderColor = `${config.color}50`;
  if (entity === "grid"    && metrics.power < -0.05) borderColor = "rgba(239,68,68,0.4)";

  const glow =
    entity === "battery" && metrics.power < -0.05
      ? `0 0 28px ${config.color}25`
      : entity === "grid" && metrics.power < -0.05
      ? "0 0 28px rgba(239,68,68,0.15)"
      : `0 0 16px ${config.color}10`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
        transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      }}
    >
      {/* Row layout */}
      <div className="flex items-stretch">
        {/* Left: entity identity strip */}
        <div
          className="flex flex-col items-center justify-center gap-3 px-5 py-4"
          style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.25)",
            minWidth: 110,
          }}
        >
          {/* Color glow dot */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: config.color, boxShadow: `0 0 10px ${config.color}, 0 0 20px ${config.color}60` }}
          />
          <span
            className="text-sm font-black tracking-widest uppercase"
            style={{ color: config.color, letterSpacing: "0.22em", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
          >
            {config.label}
          </span>
          {/* State badge */}
          <div
            className="px-2 py-0.5 rounded-full text-xs font-mono font-bold text-center"
            style={{
              background: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              letterSpacing: "0.06em",
              fontSize: 9,
              whiteSpace: "nowrap",
            }}
          >
            {badge.label}
          </div>
        </div>

        {/* Center: 4 radial gauges */}
        <div className="flex-1 flex items-center justify-around px-4 py-4 gap-2">
          <MetricGauge
            value={metrics.voltage}
            min={ranges.voltage.min}
            max={ranges.voltage.max}
            color={config.color}
            label="Voltage"
            unit={ranges.voltage.unit}
            size={130}
          />
          <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          <MetricGauge
            value={metrics.current}
            min={ranges.current.min}
            max={ranges.current.max}
            color={config.color}
            label="Current"
            unit={ranges.current.unit}
            size={130}
          />
          <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          <MetricGauge
            value={metrics.power}
            min={ranges.power.min}
            max={ranges.power.max}
            color={config.color}
            label="Power"
            unit={ranges.power.unit}
            size={130}
          />
          <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          <MetricGauge
            value={metrics.energy}
            min={ranges.energy.min}
            max={ranges.energy.max}
            color={config.color}
            label="Energy"
            unit={ranges.energy.unit}
            size={130}
          />
        </div>

        {/* Right: sparkline */}
        <div
          className="flex flex-col justify-center px-4 py-4"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", minWidth: 160, maxWidth: 200, background: "rgba(0,0,0,0.15)" }}
        >
          <div className="text-xs uppercase mb-2" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", fontSize: 9 }}>
            Power · 60s
          </div>
          <Sparkline history={history} entity={entity} color={config.color} height={80} />
          {/* Live value callout */}
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="font-mono font-bold text-lg"
              style={{ color: metrics.power < 0 ? "#EF4444" : config.color }}
            >
              {metrics.power >= 0 ? "+" : ""}{metrics.power.toFixed(2)}
            </span>
            <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
