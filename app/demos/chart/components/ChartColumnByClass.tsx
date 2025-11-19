'use client';

import dynamic from 'next/dynamic';
import Highcharts from 'highcharts';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import { getVehicleClassColor } from '@/app/demos/chart/constants';
import aggByClass from '@/data/aggByClass.json';

type AggByClassRow = {
  vClass: string;
  avgComb08: number;
  vehicleCount: number;
};

// Internal component with original logic
function ChartColumnByClassComponent() {
  // Ensure TS sees this as an array of rows
  const rows = aggByClass as AggByClassRow[];

  // Categories / data straight from JSON (script already sorted by avgComb08 desc)
  const categories = rows.map(r => r.vClass);
  const colors = rows.map(r => getVehicleClassColor(r.vClass));
  const mpgData = rows.map(r => Number(r.avgComb08.toFixed(1)));

const options: Highcharts.Options = {
  chart: {
    type: 'column',
    backgroundColor: '#05070b',
    spacing: [10, 10, 15, 10],
  },

  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        title: {
          style: {
            fontSize: '14px'
          }
        },
        subtitle: {
          style: {
            fontSize: '10px'
          }
        },
        xAxis: {
          labels: {
            rotation: -90,
            style: {
              fontSize: '9px'
            }
          }
        },
        chart: {
          marginBottom: 120
        }
      }
    }]
  },
  title: {
    text: 'Average Fuel Efficiency by Vehicle Class',
    align: 'left',
    style: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '16px',
    },
  },
  subtitle: {
    text: 'Combined MPG (EPA dataset, aggregated by class)',
    align: 'left',
    style: {
      color: '#aaaaaa',
      fontSize: '12px',
    },
  },
  credits: { enabled: false },
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
      },
    },
  },

  xAxis: {
    categories,
    title: { text: 'Vehicle Class', style: { color: '#7ee7ff' } },
    labels: {
      rotation: -45, // 🔁 rotated labels
      style: {
        color: '#7ee7ff',
        fontSize: '10px',
      },
    },
    lineColor: '#345c68',
    tickColor: '#345c68',
  },

  yAxis: {
    min: 0,
    title: {
      text: 'Average Combined MPG',
      style: { color: '#f8f0ff', fontSize: '14px' },
    },
    gridLineColor: '#10252a',
    labels: { style: { color: '#f8f0ff', fontSize: '10px' } },
  },

  tooltip: {
    shared: true,
    backgroundColor: '#05070b',
    borderColor: '#888',
    style: { color: '#ffffff', fontSize: '11px' },
    formatter: function () {
      const point = this as any;
      const idx = point?.index ?? 0;
      const row = rows[idx];
      return `
        <b>${row.vClass}</b><br/>
        Average MPG: <b>${row.avgComb08.toFixed(1)}</b><br/>
        Vehicles in dataset: <b>${row.vehicleCount}</b>
      `;
    },
  },

  plotOptions: {
    column: {
      borderWidth: 0,
      pointPadding: 0.1,
      groupPadding: 0.05,
    },
  },

  series: [
    {
      type: 'column',
      name: 'Avg MPG',
      data: mpgData.map((value, index) => ({
        y: value,
        color: colors[index],
      })),
    },
  ],
};

  return (
    <div className="w-full h-[500px] sm:h-[400px] md:h-[420px]">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </div>
  );
}

// Export as dynamic component with SSR disabled
const ChartColumnByClass = dynamic(
  () => Promise.resolve(ChartColumnByClassComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] sm:h-[320px] md:h-[420px] flex items-center justify-center text-white">
        Loading chart...
      </div>
    ),
  }
);

export default ChartColumnByClass;
