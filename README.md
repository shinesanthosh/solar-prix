# Solar Prix

An F1-inspired solar energy monitoring dashboard built with Next.js 16, Recharts, and Tailwind CSS.

> **Note:** The dashboard is currently running on mock data. A live API integration is planned — see [Connecting a Real API](#connecting-a-real-api) below.

![Solar Prix Dashboard](https://img.shields.io/badge/status-mock--data-orange) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## Features

- **Live-updating dashboard** — all values refresh every second via a smooth random-walk mock API
- **4 monitored entities** — Solar, Battery, Load, Grid
- **Per-entity metrics** — Voltage, Current, Power, Energy
- **Supports negative values** — battery discharge and grid import/export rendered correctly
- **F1-style tachometer bars** — segmented LED-style bars with major/minor breakpoint tick marks
- **Radial arc gauges** — per-entity rows with 4 gauges each (voltage, current, power, energy)
- **Supply vs Demand chart** — stacked area chart showing solar/battery/grid contributions vs load
- **State badges** — CHARGING / DISCHARGING, IMPORTING / EXPORTING, PEAK / GENERATING
- **Scrolling ticker** — F1 broadcast-style data ticker in the header

---

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx            # F1 ticker bar + live clock
│   ├── TachometerPanel.tsx   # Segmented power bars + balance widget
│   ├── SupplyDemandChart.tsx # Stacked area chart
│   ├── EntityCard.tsx        # Per-entity row with 4 radial gauges
│   ├── MetricGauge.tsx       # SVG arc gauge with ticks and needle
│   └── Sparkline.tsx         # 60s rolling area chart
└── lib/
    └── mockApi.ts            # useMockData() hook — replace this with real API
```

---

## Connecting a Real API

All data flows from a single hook in [`src/lib/mockApi.ts`](src/lib/mockApi.ts). To connect a real API, replace the `useMockData()` hook with one that fetches from your backend — the rest of the dashboard will work without any other changes.

The hook must return a `DashboardData` object:

```ts
interface EntityMetrics {
  voltage: number;
  current: number;
  power:   number;  // negative = discharge/export
  energy:  number;
}

interface DashboardData {
  solar:   EntityMetrics;
  battery: EntityMetrics;
  load:    EntityMetrics;
  grid:    EntityMetrics;
  history: HistoryPoint[];  // last 60 data points for charts
}
```

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, client components
- [Recharts](https://recharts.org/) — Supply/demand chart and sparklines
- [Tailwind CSS](https://tailwindcss.com/) — Layout and utilities
- SVG — Tachometer bars and radial gauges (hand-rolled, no library)
