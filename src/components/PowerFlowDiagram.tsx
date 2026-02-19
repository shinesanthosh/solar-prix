"use client";

import { DashboardData, ENTITY_CONFIG } from "@/lib/mockApi";

interface Props {
  data: DashboardData;
}

interface NodeDef {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  power: number;
  icon: string;
}

function FlowArrow({
  from, to, power, color, id,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  power: number;
  color: string;
  id: string;
}) {
  if (Math.abs(power) < 0.05) return null;

  const flowing = power > 0;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;

  // Start/end with node radius offset
  const nr = 36;
  const x1 = from.x + nx * nr;
  const y1 = from.y + ny * nr;
  const x2 = to.x - nx * nr;
  const y2 = to.y - ny * nr;

  // Slightly curved path
  const mx = (x1 + x2) / 2 + ny * 15;
  const my = (y1 + y2) / 2 - nx * 15;

  const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const intensity = Math.min(1, Math.abs(power) / 5);
  const strokeOpacity = 0.4 + intensity * 0.5;
  const strokeWidth = 1 + intensity * 2;

  return (
    <g>
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={color} opacity={strokeOpacity} />
        </marker>
      </defs>

      {/* Glow track */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 4}
        strokeOpacity={0.05}
        strokeDasharray="none"
      />

      {/* Animated dashed line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray="6 4"
        strokeLinecap="round"
        className={flowing ? "flow-line" : "flow-line-reverse"}
        markerEnd={`url(#arrow-${id})`}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />

      {/* Power label on midpoint */}
      <text
        x={mx}
        y={my}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
        fill={color}
        opacity={0.8}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      >
        {Math.abs(power).toFixed(1)}kW
      </text>
    </g>
  );
}

function Node({ x, y, label, color, icon, power }: NodeDef) {
  const isActive = Math.abs(power) > 0.05;
  return (
    <g>
      {/* Outer glow ring */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={44}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.15}
          className="glow-pulse"
        />
      )}

      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={36}
        fill={`${color}15`}
        stroke={color}
        strokeWidth={1.5}
        style={{ filter: isActive ? `drop-shadow(0 0 12px ${color}60)` : "none" }}
      />

      {/* Icon */}
      <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="middle" fontSize="20">
        {icon}
      </text>

      {/* Label */}
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="700"
        fill={color}
        letterSpacing="2"
      >
        {label.toUpperCase()}
      </text>

      {/* Power badge */}
      <text
        x={x}
        y={y + 54}
        textAnchor="middle"
        fontSize="11"
        fontFamily="monospace"
        fontWeight="700"
        fill={power < 0 ? "#EF4444" : "rgba(255,255,255,0.8)"}
      >
        {power >= 0 ? "+" : ""}{power.toFixed(2)} kW
      </text>
    </g>
  );
}

export default function PowerFlowDiagram({ data }: Props) {
  const W = 700;
  const H = 220;

  const nodes: NodeDef[] = [
    { id: "solar", label: "Solar", color: ENTITY_CONFIG.solar.color, x: W * 0.15, y: H / 2, power: data.solar.power, icon: "☀️" },
    { id: "battery", label: "Battery", color: ENTITY_CONFIG.battery.color, x: W * 0.38, y: H / 2, power: data.battery.power, icon: "🔋" },
    { id: "load", label: "Load", color: ENTITY_CONFIG.load.color, x: W * 0.62, y: H / 2, power: data.load.power, icon: "⚡" },
    { id: "grid", label: "Grid", color: ENTITY_CONFIG.grid.color, x: W * 0.85, y: H / 2, power: data.grid.power, icon: "🔌" },
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Solar → Battery (when battery charging from solar)
  const solarToBattery = data.battery.power > 0 ? Math.min(data.solar.power, data.battery.power) : 0;
  // Solar → Load
  const solarToLoad = Math.max(0, data.solar.power - solarToBattery);
  // Battery → Load (when discharging)
  const batteryToLoad = data.battery.power < 0 ? Math.abs(data.battery.power) : 0;
  // Grid → Load (when importing)
  const gridToLoad = data.grid.power < 0 ? Math.abs(data.grid.power) : 0;
  // Load → Grid (excess exported)
  const loadToGrid = data.grid.power > 0 ? data.grid.power : 0;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, #F59E0B, #10B981)" }} />
        <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>
          Power Flow
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ maxHeight: 220, minWidth: 400 }}
        >
          {/* Flows */}
          {solarToBattery > 0.05 && (
            <FlowArrow from={nodeMap.solar} to={nodeMap.battery} power={solarToBattery} color={ENTITY_CONFIG.solar.color} id="sol-bat" />
          )}
          {solarToLoad > 0.05 && (
            <FlowArrow from={nodeMap.solar} to={nodeMap.load} power={solarToLoad} color={ENTITY_CONFIG.solar.color} id="sol-load" />
          )}
          {batteryToLoad > 0.05 && (
            <FlowArrow from={nodeMap.battery} to={nodeMap.load} power={batteryToLoad} color={ENTITY_CONFIG.battery.color} id="bat-load" />
          )}
          {gridToLoad > 0.05 && (
            <FlowArrow from={nodeMap.grid} to={nodeMap.load} power={gridToLoad} color={ENTITY_CONFIG.grid.color} id="grid-load" />
          )}
          {loadToGrid > 0.05 && (
            <FlowArrow from={nodeMap.load} to={nodeMap.grid} power={loadToGrid} color={ENTITY_CONFIG.load.color} id="load-grid" />
          )}

          {/* Nodes */}
          {nodes.map((n) => (
            <Node key={n.id} {...n} />
          ))}
        </svg>
      </div>
    </div>
  );
}
