'use client';

// Custom Layout Components
import { PageGrid } from "@/components/layout/page-grid";
import { PageMain } from "@/components/layout/page-main";
import dynamic from 'next/dynamic';

// NOTE: Temporarily disabled due to Highcharts' incompatibility with SSR within Next.js
// import ChartRadarScatterByClass from "@/app/demos/chart/components/ChartRadarScatterByClass";
// import ChartColumnByClass from "@/app/demos/chart/components/ChartColumnByClass";
// import ChartForceClassFuel from "@/app/demos/chart/components/ChartForceClassFuel";
// import ChartFuelStackedByClass from "@/app/demos/chart/components/ChartFuelStackedByClass";

export default function ChartDemosPage() {

  const ImportedChartRadarScatterByClass = dynamic(
    () => import("@/app/demos/chart/components/ChartRadarScatterByClass"),
    {
      loading: () => (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      ),
      ssr: false
    }
  );

  const ImportedChartColumnByClass = dynamic(
    () => import("@/app/demos/chart/components/ChartColumnByClass"),
    {
      loading: () => (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      ),
      ssr: false
    }
  );

  const ImportedChartForceClassFuel = dynamic(
    () => import("@/app/demos/chart/components/ChartForceClassFuel"),
    {
      loading: () => (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      ),
      ssr: false
    }
  );

  const ImportedChartFuelStackedByClass = dynamic(
    () => import("@/app/demos/chart/components/ChartFuelStackedByClass"),
    {
      loading: () => (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      ),
      ssr: false
    }
  );

  return (
    <PageMain>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            Highcharts Demo:LEO-style Radar Visualization (Simulated)
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            All plots are based on real vehicle fuel economy data, projected into a range / doppler
            style coordinate system to mimic LeoLabs radar detections.
          </p>
        </header>

        {/* Grid of charts */}
        <PageGrid columns={{ sm: 1, md: 2 }}>
          {/* Top: radar scatter chart - spans full width on all screens */}
          <section className="col-span-full bg-[#05070b] rounded-md border border-slate-800 p-3">

            <ImportedChartRadarScatterByClass />
          </section>

          {/* Middle-left: column chart - full width on small, 50% on medium+ */}
          <section className="col-span-full md:col-span-1 bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ImportedChartColumnByClass />
          </section>

          {/* Middle-right: force chart - full width on small, 50% on medium+ */}
          <section className="col-span-full md:col-span-1 bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ImportedChartForceClassFuel />
          </section>

          {/* Bottom: stacked fuel chart - spans full width on all screens */}
          <section className="col-span-full bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ImportedChartFuelStackedByClass />
          </section>
        </PageGrid>
      </div>
    </PageMain>
  )
}
