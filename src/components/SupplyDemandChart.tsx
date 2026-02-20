"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HistoryPoint, ENTITY_CONFIG } from "@/lib/mockApi";

interface Props {
  history: HistoryPoint[];
}

interface ChartPoint {
  t: number;
  label: string;
  solarSupply: number;
  batterySupply: number;
  gridSupply: number;
  load: number;
  totalSupply: number;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(10,10,10,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "monospace",
        fontSize: 11,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color }} />
          <span style={{ color: "rgba(255,255,255,0.5)", minWidth: 90 }}>{entry.name}</span>
          <span style={{ color: entry.value < 0 ? "#EF4444" : "rgba(255,255,255,0.9)", fontWeight: "bold" }}>
            {entry.value?.toFixed(2)} kW
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SupplyDemandChart({ history }: Props) {
  const chartData: ChartPoint[] = history.map((h) => {
    // Solar always positive (0 if night)
    const solarSupply = Math.max(0, h.solar);
    // Battery contributes when discharging (power < 0 in our convention = discharging)
    const batterySupply = h.battery < 0 ? Math.abs(h.battery) : 0;
    // Grid contributes when importing (power < 0 = importing)
    const gridSupply = h.grid < 0 ? Math.abs(h.grid) : 0;

    return {
      t: h.t,
      label: formatTime(h.t),
      solarSupply,
      batterySupply,
      gridSupply,
      load: h.load,
      totalSupply: solarSupply + batterySupply + gridSupply,
    };
  });

  // Pad with empty data if not enough
  if (chartData.length < 2) {
    return (
      <div
        className="rounded-xl p-4 flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", height: 200 }}
      >
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
          Collecting data...
        </span>
      </div>
    );
  }

  const allValues = chartData.flatMap((d) => [d.solarSupply, d.batterySupply, d.gridSupply, d.load, d.totalSupply]);
  const yMax = Math.ceil(Math.max(...allValues) * 1.15);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, #F59E0B, #8B5CF6)" }} />
          <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>
            Supply vs Demand
          </span>
        </div>

        {/* Legend chips */}
        <div className="flex items-center gap-3">
          {[
            { label: "Solar", color: ENTITY_CONFIG.solar.color },
            { label: "Battery", color: ENTITY_CONFIG.battery.color },
            { label: "Grid", color: ENTITY_CONFIG.grid.color },
            { label: "Load", color: ENTITY_CONFIG.load.color },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENTITY_CONFIG.solar.color} stopOpacity={0.5} />
              <stop offset="95%" stopColor={ENTITY_CONFIG.solar.color} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENTITY_CONFIG.battery.color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={ENTITY_CONFIG.battery.color} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENTITY_CONFIG.grid.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={ENTITY_CONFIG.grid.color} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontFamily: "monospace", fill: "rgba(255,255,255,0.2)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "monospace", fill: "rgba(255,255,255,0.2)" }}
            tickLine={false}
            axisLine={false}
            domain={[0, yMax]}
            tickFormatter={(v) => `${v}kW`}
          />

          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />

          {/* Stacked supply areas */}
          <Area
            type="monotone"
            dataKey="solarSupply"
            name="Solar"
            stackId="supply"
            stroke={ENTITY_CONFIG.solar.color}
            strokeWidth={1.5}
            fill="url(#solarGrad)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="batterySupply"
            name="Battery"
            stackId="supply"
            stroke={ENTITY_CONFIG.battery.color}
            strokeWidth={1.5}
            fill="url(#batteryGrad)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="gridSupply"
            name="Grid"
            stackId="supply"
            stroke={ENTITY_CONFIG.grid.color}
            strokeWidth={1.5}
            fill="url(#gridGrad)"
            dot={false}
            isAnimationActive={false}
          />

          {/* Load demand line */}
          <Line
            type="monotone"
            dataKey="load"
            name="Load"
            stroke={ENTITY_CONFIG.load.color}
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="6 3"
            isAnimationActive={false}
            style={{ filter: `drop-shadow(0 0 6px ${ENTITY_CONFIG.load.color}80)` }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
