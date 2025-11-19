'use client';

import dynamic from 'next/dynamic';
import { getVehicleClassColor } from '@/app/demos/chart/constants';
import Highcharts from 'highcharts';
import 'highcharts/modules/exporting';
import 'highcharts/modules/networkgraph';
import HighchartsReact from 'highcharts-react-official';
import forceGraph from '@/data/forceGraph.json';

type ForceNode = {
  id: string;
  type: 'vClass' | 'fuelType';
};

type ForceLink = {
  source: string;
  target: string;
  weight: number;
};

type ForceGraphData = {
  nodes: ForceNode[];
  links: ForceLink[];
};

const data = forceGraph as ForceGraphData;

// const vClassNodes = data.nodes.filter(n => n.type === 'vClass');
// const fuelNodes = data.nodes.filter(n => n.type === 'fuelType');

// Map id → type for styling in series.nodes
const nodeTypes = new Map<string, ForceNode['type']>();
for (const n of data.nodes) {
  nodeTypes.set(n.id, n.type);
}

// networkgraph expects links as [from, to, weight?]
const linkData: (string | number)[][] = data.links.map(link => [
  link.source,
  link.target,
  link.weight,
]);

const options: Highcharts.Options = {
  chart: {
    type: 'networkgraph',
    backgroundColor: '#05070b',
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
        }
      }
    }]
  },
  title: {
    text: 'Vehicle Classes vs Fuel Types',
    align: 'left',
    style: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '16px',
    },
  },
  subtitle: {
    text: 'Force-directed layout showing which fuel types are used by which classes',
    align: 'left',
    style: { color: '#aaaaaa', fontSize: '12px' },
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

  tooltip: {
    backgroundColor: '#05070b',
    borderColor: '#888',
    style: { color: '#ffffff', fontSize: '11px' },
    formatter: function () {
      const p = this as Highcharts.Point & { id: string };
      const type = nodeTypes.get(p.id);
      if (!type) {
        return `<b>${p.id}</b>`;
      }
      if (type === 'vClass') {
        return `<b>Vehicle class:</b> ${p.id}`;
      }
      return `<b>Fuel type:</b> ${p.id}`;
    },
  },

  plotOptions: {
    networkgraph: {
      keys: ['from', 'to', 'weight'],
      layoutAlgorithm: {
        enableSimulation: true,
        friction: -0.9,
        linkLength: 80,
      },
    },
  },

  series: [
    {
      type: 'networkgraph',
      name: 'Class–Fuel Relationships',
      data: linkData,
      // Style nodes by type
      nodes: data.nodes.map(n => ({
        id: n.id,
        marker: {
          radius: n.type === 'vClass' ? 11 : 7,
        },
        color: n.type === 'vClass' ? getVehicleClassColor(n.id) : '#ff9ff3',
      })),
    },
  ],
};

// Internal component with original logic
function ChartForceClassFuelComponent() {
  return (
    <div className="w-full h-[400px] sm:h-[400px] md:h-[420px]">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </div>
  );
}

// Export as dynamic component with SSR disabled
const ChartForceClassFuel = dynamic(
  () => Promise.resolve(ChartForceClassFuelComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] sm:h-[320px] md:h-[420px] flex items-center justify-center text-white">
        Loading chart...
      </div>
    ),
  }
);

export default ChartForceClassFuel;
