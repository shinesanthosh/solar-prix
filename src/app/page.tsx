"use client";

import { useMockData } from "@/lib/mockApi";
import Header from "@/components/Header";
import TachometerPanel from "@/components/TachometerPanel";
import SupplyDemandChart from "@/components/SupplyDemandChart";
import EntityCard from "@/components/EntityCard";

export default function Home() {
  const data = useMockData();

  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>
      <Header data={data} />

      <div className="px-4 py-4 space-y-4 max-w-[1800px] mx-auto">
        {/* Tachometer Panel */}
        <TachometerPanel data={data} />

        {/* Supply vs Demand Chart */}
        <SupplyDemandChart history={data.history} />

        {/* Entity Rows */}
        <div className="flex flex-col gap-3">
          <EntityCard entity="solar"   metrics={data.solar}   history={data.history} />
          <EntityCard entity="battery" metrics={data.battery} history={data.history} />
          <EntityCard entity="load"    metrics={data.load}    history={data.history} />
          <EntityCard entity="grid"    metrics={data.grid}    history={data.history} />
        </div>
      </div>
    </main>
  );
}
