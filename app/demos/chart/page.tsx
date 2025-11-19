// Custom Layout Components
import { PageGrid } from "@/components/layout/page-grid";
import { PageMain } from "@/components/layout/page-main";

// Custom Highcharts
import ChartRadarScatterByClass from "@/app/demos/chart/components/ChartRadarScatterByClass";
import ChartColumnByClass from "@/app/demos/chart/components/ChartColumnByClass";
import ChartForceClassFuel from "@/app/demos/chart/components/ChartForceClassFuel";
import ChartFuelStackedByClass from "@/app/demos/chart/components/ChartFuelStackedByClass";

export default function ChartDemosPage() {


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
            <ChartRadarScatterByClass />
          </section>

          {/* Middle-left: column chart - full width on small, 50% on medium+ */}
          <section className="col-span-full md:col-span-1 bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ChartColumnByClass />
          </section>

          {/* Middle-right: force chart - full width on small, 50% on medium+ */}
          <section className="col-span-full md:col-span-1 bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ChartForceClassFuel />
          </section>

          {/* Bottom: stacked fuel chart - spans full width on all screens */}
          <section className="col-span-full bg-[#05070b] rounded-md border border-slate-800 p-3">
            <ChartFuelStackedByClass />
          </section>
        </PageGrid>
      </div>
    </PageMain>
  )
}
