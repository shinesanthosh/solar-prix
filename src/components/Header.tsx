"use client";

import { useEffect, useState } from "react";
import { DashboardData, ENTITY_CONFIG } from "@/lib/mockApi";

interface Props {
  data: DashboardData;
}

export default function Header({ data }: Props) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const tickerItems = [
    { label: "SOLAR", value: `${data.solar.power.toFixed(2)} kW`, color: ENTITY_CONFIG.solar.color },
    { label: "BATTERY", value: `${data.battery.power.toFixed(2)} kW`, color: ENTITY_CONFIG.battery.color },
    { label: "LOAD", value: `${data.load.power.toFixed(2)} kW`, color: ENTITY_CONFIG.load.color },
    { label: "GRID", value: `${data.grid.power.toFixed(2)} kW`, color: ENTITY_CONFIG.grid.color },
    { label: "BATT SOC", value: `${((data.battery.energy / 20) * 100).toFixed(1)}%`, color: ENTITY_CONFIG.battery.color },
    { label: "SOLAR V", value: `${data.solar.voltage.toFixed(0)} V`, color: ENTITY_CONFIG.solar.color },
    { label: "GRID V", value: `${data.grid.voltage.toFixed(0)} V`, color: ENTITY_CONFIG.grid.color },
    { label: "TOTAL LOAD", value: `${data.load.energy.toFixed(1)} kWh`, color: ENTITY_CONFIG.load.color },
  ];

  return (
    <header style={{ background: "#0A0A0A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-[0.2em] uppercase" style={{ letterSpacing: "0.25em" }}>
                Solar Prix
              </div>
              <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em" }}>
                Energy Monitoring System
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="w-2 h-2 rounded-full bg-red-500 glow-pulse" style={{ boxShadow: "0 0 6px #EF4444" }} />
            <span className="text-xs font-mono tracking-widest text-red-400 uppercase">Live</span>
          </div>
        </div>

        {/* Time */}
        <div className="text-right">
          <div className="font-mono text-2xl font-bold" style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.1em" }}>
            {time}
          </div>
          <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
            {date}
          </div>
        </div>
      </div>

      {/* F1 Ticker */}
      <div
        className="overflow-hidden py-2"
        style={{ background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="ticker-content flex gap-0 whitespace-nowrap" style={{ width: "200%" }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6">
              <span className="text-xs font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                {item.label}
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                {item.value}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
