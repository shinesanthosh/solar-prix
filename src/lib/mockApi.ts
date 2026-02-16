"use client";

import { useState, useEffect, useRef } from "react";

export interface EntityMetrics {
  voltage: number;
  current: number;
  power: number;
  energy: number;
}

export interface HistoryPoint {
  t: number;
  solar: number;
  battery: number;
  load: number;
  grid: number;
}

export interface DashboardData {
  solar: EntityMetrics;
  battery: EntityMetrics;
  load: EntityMetrics;
  grid: EntityMetrics;
  history: HistoryPoint[];
}

// Random walk with clamping
function walk(current: number, step: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  return Math.min(max, Math.max(min, current + delta));
}

function round(v: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

function initialState(): DashboardData {
  return {
    solar: { voltage: 380, current: 10, power: 5.0, energy: 24.5 },
    battery: { voltage: 52, current: 10, power: 0.5, energy: 14.0 },
    load: { voltage: 230, current: 12, power: 2.8, energy: 18.0 },
    grid: { voltage: 230, current: 5, power: 1.2, energy: 8.0 },
    history: [],
  };
}

function nextState(prev: DashboardData): DashboardData {
  const solar: EntityMetrics = {
    voltage: round(walk(prev.solar.voltage, 5, 300, 450)),
    current: round(walk(prev.solar.current, 0.5, 0, 20)),
    power: round(walk(prev.solar.power, 0.3, 0, 9)),
    energy: round(Math.min(50, prev.solar.energy + 0.001)),
  };

  const battery: EntityMetrics = {
    voltage: round(walk(prev.battery.voltage, 0.3, 40, 58)),
    current: round(walk(prev.battery.current, 3, -50, 50)),
    power: round(walk(prev.battery.power, 0.2, -3, 3)),
    energy: round(Math.min(20, Math.max(0, prev.battery.energy + prev.battery.power * 0.0003))),
  };

  const load: EntityMetrics = {
    voltage: round(walk(prev.load.voltage, 1, 220, 240)),
    current: round(walk(prev.load.current, 1, 0, 25)),
    power: round(walk(prev.load.power, 0.2, 0, 5)),
    energy: round(Math.min(30, prev.load.energy + 0.001)),
  };

  const grid: EntityMetrics = {
    voltage: round(walk(prev.grid.voltage, 1, 220, 240)),
    current: round(walk(prev.grid.current, 2, -30, 30)),
    power: round(walk(prev.grid.power, 0.4, -7, 7)),
    energy: round(walk(prev.grid.energy, 0.01, -50, 50)),
  };

  const newPoint: HistoryPoint = {
    t: Date.now(),
    solar: solar.power,
    battery: battery.power,
    load: load.power,
    grid: grid.power,
  };

  const history = [...prev.history.slice(-59), newPoint];

  return { solar, battery, load, grid, history };
}

export function useMockData(): DashboardData {
  const [data, setData] = useState<DashboardData>(initialState);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => nextState(prev));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return data;
}

export const ENTITY_CONFIG = {
  solar: {
    label: "Solar",
    color: "#F59E0B",
    ranges: {
      voltage:  { min: 300,  max: 450,  unit: "V"   },
      current:  { min: 0,    max: 20,   unit: "A"   },
      power:    { min: 0,    max: 9,    unit: "kW"  },
      energy:   { min: 0,    max: 50,   unit: "kWh" },
    },
  },
  battery: {
    label: "Battery",
    color: "#06B6D4",
    ranges: {
      voltage:  { min: 40,   max: 58,   unit: "V"   },
      current:  { min: -50,  max: 50,   unit: "A"   },
      power:    { min: -3,   max: 3,    unit: "kW"  },
      energy:   { min: 0,    max: 20,   unit: "kWh" },
    },
  },
  load: {
    label: "Load",
    color: "#8B5CF6",
    ranges: {
      voltage:  { min: 220,  max: 240,  unit: "V"   },
      current:  { min: 0,    max: 25,   unit: "A"   },
      power:    { min: 0,    max: 5,    unit: "kW"  },
      energy:   { min: 0,    max: 30,   unit: "kWh" },
    },
  },
  grid: {
    label: "Grid",
    color: "#10B981",
    ranges: {
      voltage:  { min: 220,  max: 240,  unit: "V"   },
      current:  { min: -30,  max: 30,   unit: "A"   },
      power:    { min: -7,   max: 7,    unit: "kW"  },
      energy:   { min: -50,  max: 50,   unit: "kWh" },
    },
  },
} as const;

export type EntityKey = keyof typeof ENTITY_CONFIG;
