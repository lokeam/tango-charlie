'use client';

import dynamic from 'next/dynamic';
import Highcharts from 'highcharts';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import { getVehicleClassColor } from '@/app/demos/chart/constants';

import stackedFuel from '@/data/stackedFuelByClass.json';

type StackedFuelData = {
  categories: string[];
  fuelTypes: string[];
  matrix: Record<string, Record<string, number>>;
};

const data = stackedFuel as StackedFuelData;

// Build series for stacked bars - color each bar segment by vehicle class
const series: Highcharts.SeriesOptionsType[] = data.fuelTypes.map(fuel => ({
  type: 'bar' as const,
  name: fuel,
  data: data.categories.map(cls => ({
    y: data.matrix[cls][fuel] || 0,
    color: getVehicleClassColor(cls),
  })),
}));

const options: Highcharts.Options = {
  chart: {
    type: 'bar',
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
        yAxis: {
          labels: {
            style: {
              fontSize: '8px'
            }
          }
        },
        xAxis: {
          labels: {
            style: {
              fontSize: '8px'
            }
          }
        },
        legend: {
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: {
            fontSize: '9px'
          }
        }
      }
    }]
  },

  title: {
    text: 'Fuel Types by Vehicle Class',
    align: 'left',
    style: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '16px',
    },
  },
  subtitle: {
    text: 'Each bar shows the fuel-type distribution inside each class',
    align: 'left',
    style: { color: '#aaaaaa', fontSize: '12px' },
  },
  credits: { enabled: false },
  exporting: { enabled: true },

  xAxis: {
    categories: data.categories,
    labels: { style: { color: '#7ee7ff', fontSize: '11px' } },
    lineColor: '#345c68',
  },

  yAxis: {
    min: 0,
    title: {
      text: 'Vehicle Count',
      style: { color: '#f8f0ff', fontSize: '14px' },
    },
    gridLineColor: '#10252a',
    labels: { style: { color: '#f8f0ff', fontSize: '10px' } },
    stackLabels: {
      enabled: true,
      style: { color: '#ffffff' },
    },
  },

  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    layout: 'horizontal',
    reversed: true,
    itemStyle: {
      color: '#ffffff',
      fontSize: '11px'
    }
  },

  plotOptions: {
    series: {
      stacking: 'normal',
      borderWidth: 0,
    },
  },
  series,
};

// Internal component with original logic
function ChartFuelStackedByClassComponent() {
  return (
    <div className="w-full h-[600px] sm:h-[500px] md:h-[420px]">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </div>
  );
}

// Export as dynamic component with SSR disabled
const ChartFuelStackedByClass = dynamic(
  () => Promise.resolve(ChartFuelStackedByClassComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] sm:h-[320px] md:h-[420px] flex items-center justify-center text-white">
        Loading chart...
      </div>
    ),
  }
);

export default ChartFuelStackedByClass;
