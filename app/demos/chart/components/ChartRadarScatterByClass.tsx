// RadarScatterAll
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import scatterAll from '@/data/scatterAll.json';

import { getVehicleClassColor } from '@/app/demos/chart/constants';


type ScatterRow = {
  leoRangeKm: number;
  leoDopplerMps: number;
  snrDb: number;
  vClass: string;
  fuelType: string;
  year: number;
  make: string;
  model: string;
};

// Extend PointOptionsObject to include our custom properties
interface CustomPointOptions extends Highcharts.PointOptionsObject {
  make?: string;
  model?: string;
  snrDb?: number;
  vClass?: string;
  fuelType?: string;
  year?: number;
}

const MAX_CLASSES_IN_LEGEND = 8;

function buildSeriesByClass(rows: ScatterRow[]): Highcharts.SeriesScatterOptions[] {
  // Count by vClass
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.vClass, (counts.get(row.vClass) || 0) + 1);
  }

  // Sort classes by frequency, take top N
  const sortedClasses = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const mainClasses = sortedClasses.slice(0, MAX_CLASSES_IN_LEGEND);
  const isMain = new Set(mainClasses);

  // Build buckets
  const byClass = new Map<string, Highcharts.PointOptionsObject[]>();
  const otherPoints: Highcharts.PointOptionsObject[] = [];

  for (const p of rows) {
    const point: CustomPointOptions = {
      x: p.leoRangeKm,
      y: p.leoDopplerMps,
      snrDb: p.snrDb,
      vClass: p.vClass,
      fuelType: p.fuelType,
      year: p.year,
      make: p.make,
      model: p.model,
    };

    if (isMain.has(p.vClass)) {
      if (!byClass.has(p.vClass)) byClass.set(p.vClass, []);
      byClass.get(p.vClass)!.push(point);
    } else {
      otherPoints.push(point);
    }
  }

  const series: Highcharts.SeriesScatterOptions[] = [];

  // One series per main class with its own color
  mainClasses.forEach((cls) => {
    series.push({
      type: 'scatter',
      name: cls,
      data: byClass.get(cls) || [],
      color: getVehicleClassColor(cls),
      marker: {
        radius: 3,
        symbol: 'circle',
      },
    });
  });

  // Lump the rest into a grey “Others” bucket
  if (otherPoints.length > 0) {
    series.push({
      type: 'scatter',
      name: 'Other classes',
      data: otherPoints,
      color: '#3a3f4f',
      marker: {
        radius: 2,
        symbol: 'circle',
      },
    });
  }

  return series;
}

const raw = scatterAll as ScatterRow[];
const seriesByClass = buildSeriesByClass(raw);

const options: Highcharts.Options = {
  accessibility: {
    enabled: false,
  },
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
      }
    },
    fallbackToExportServer: false
  },

  chart: {
    type: 'scatter',
    backgroundColor: '#05070b',
    zooming: {
      type: 'xy'
    },
    spacing: [10, 10, 15, 10],
    width: null, // Let container control width
    height: null, // Let container control height
    events: {
      load: function() {
        const chart = this;
        console.log(' CHART DEBUG - Load Event');
        console.log('Container parent:', chart.container.parentNode);
        console.log('Container dimensions:', {
          width: chart.container.parentNode?.offsetWidth,
          height: chart.container.parentNode?.offsetHeight
        });
        console.log('Chart calculated size:', {
          width: chart.chartWidth,
          height: chart.chartHeight
        });
        console.log('Chart container style:', {
          width: chart.container.style.width,
          height: chart.container.style.height
        });

        const resizeChart = () => {
          if (chart.container && chart.container.parentNode) {
            const container = chart.container.parentNode as HTMLElement;
            const width = container.offsetWidth;
            const height = container.offsetHeight;

            console.log(' RESIZE DEBUG:', {
              containerWidth: width,
              containerHeight: height,
              chartWidth: chart.chartWidth,
              chartHeight: chart.chartHeight,
              windowWidth: window.innerWidth
            });

            chart.setSize(width, height, false);
          }
        };

        // Initial resize
        setTimeout(resizeChart, 100);

        // Listen for window resize
        window.addEventListener('resize', () => {
          setTimeout(resizeChart, 100);
        });
      },

      redraw: function() {
        console.log(' REDRAW DEBUG:', {
          chartWidth: this.chartWidth,
          chartHeight: this.chartHeight,
          plotWidth: this.plotWidth,
          plotHeight: this.plotHeight,
          windowWidth: window.innerWidth
        });
      }
    }
  },

  //   rules: [{
  //     condition: {
  //       maxWidth: 768
  //     },
  //     chartOptions: {
  //       legend: {
  //         itemStyle: {
  //           fontSize: '10px'
  //         },
  //         maxHeight: 60
  //       },
  //       yAxis: {
  //         title: {
  //           text: null
  //         }
  //       },
  //       xAxis: {
  //         title: {
  //           text: null
  //         }
  //       },
  //       title: {
  //         style: {
  //           fontSize: '14px'
  //         }
  //       },
  //       subtitle: {
  //         style: {
  //           fontSize: '11px'
  //         }
  //       }
  //     }
  //   }, {
  //     condition: {
  //       maxWidth: 630
  //     },
  //     chartOptions: {
  //       legend: {
  //         enabled: false
  //       },
  //       title: {
  //         style: {
  //           fontSize: '12px'
  //         }
  //       },
  //       subtitle: {
  //         enabled: false
  //       }
  //     }
  //   }]
  // },
  title: {
    text: 'CO₂ emissions vs fuel efficiency',
    align: 'left',
    style: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '18px',
    },
  },
  subtitle: {
    text: '<a href="https://www.kaggle.com/datasets/thedevastator/fuel-economy-data-how-efficient-are-today-s-cars?resource=download">Fuel Economy Data: How Efficient Are Today&apos;s Cars?</a>',
    align: 'left',
    style: {
      color: '#ffffff',
      fontSize: '14px',
    },
  },
  credits: { enabled: false },

  legend: {
    enabled: true,
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      color: '#ffffff',
      fontSize: '11px',
    },
    itemHoverStyle: {
      color: '#FF0000',
    },
    backgroundColor: 'rgba(5,7,11,0.9)',
    borderColor: '#222',
    borderWidth: 1,
  },

  xAxis: {
    title: {
      text: 'Relative Fuel Efficiency (projected from MPG)',
      style: { color: '#7ee7ff', fontSize: '14px' },
    },
    gridLineColor: '#10252a',
    lineColor: '#345c68',
    tickColor: '#345c68',
    labels: { style: { color: '#7ee7ff', fontSize: '9px' } },
  },

  yAxis: {
    title: {
      text: 'Relative CO₂ Emissions (projected)',
      style: { color: '#f8f0ff', fontSize: '14px' },
    },
    gridLineColor: '#10252a',
    lineColor: '#345c68',
    tickColor: '#345c68',
    labels: { style: { color: '#f8f0ff', fontSize: '9px' } },
  },

  // No colorAxis here: color is per-series, not continuous
  tooltip: {
    backgroundColor: '#05070b',
    borderColor: '#888',
    style: { color: '#ffffff', fontSize: '11px' },
    formatter: function () {
      const point = this as Highcharts.Point & CustomPointOptions;
      return `
      <b>Vehicle:</b> ${point.make || 'Unknown'} ${point.model || ''}<br/>
      <b>Class:</b> ${point.vClass || 'Unknown'}<br/>
      <b>Fuel efficiency score:</b> ${this.x?.toFixed(0)}<br/>
      <b>CO₂ emissions score:</b> ${this.y?.toFixed(0)}<br/>
      <b>Fuel impact score (simulated):</b> ${
        point.snrDb?.toFixed(1) || 'N/A'
      }<br/>
      <b>Fuel type:</b> ${point.fuelType || 'Unknown'}<br/>
      <b>Model year:</b> ${point.year || 'Unknown'}
    `;
    },
  },

  plotOptions: {
    series: {
      turboThreshold: 0,
      // Slight halo like their dots
      states: {
        hover: {
          halo: {
            size: 5,
            opacity: 0.9,
          },
        },
      },
    },
    scatter: {
      marker: {
        lineWidth: 0,
        fillOpacity: 0.9,
      },
    },
  },

  series: seriesByClass,
  responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                chart: {
                    className: 'small-chart'
                },
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                },
            }
        }]
    }
};

// Internal component with original logic
function RadarScatterByClassComponent() {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const handleResize = () => {
      console.log(' Window resize triggered, innerWidth:', window.innerWidth);

      if (chartRef.current?.chart) {
        setTimeout(() => {
          const chart = chartRef.current?.chart;
          if (chart) {
            const container = chart.container.parentNode as HTMLElement;
            if (container) {
              console.log(' Container measurements:', {
                offsetWidth: container.offsetWidth,
                offsetHeight: container.offsetHeight,
                scrollWidth: container.scrollWidth,
                scrollHeight: container.scrollHeight,
                clientWidth: container.clientWidth,
                clientHeight: container.clientHeight
              });

              console.log(' Chart measurements before resize:', {
                chartWidth: chart.chartWidth,
                chartHeight: chart.chartHeight,
                containerWidth: chart.container.offsetWidth,
                containerHeight: chart.container.offsetHeight
              });

              // Check for overflow
              if (container.scrollWidth > container.offsetWidth) {
                console.log(' HORIZONTAL OVERFLOW DETECTED!');
                console.log('ScrollWidth:', container.scrollWidth, 'vs OffsetWidth:', container.offsetWidth);
              }

              // Add 1px buffer to prevent rounding issues
              const safeWidth = Math.max(container.offsetWidth - 1, 100);
              const safeHeight = Math.max(container.offsetHeight - 1, 100);

              chart.reflow();
              chart.redraw();
              chart.setSize(safeWidth, safeHeight, false);

              console.log(' Chart measurements after resize:', {
                chartWidth: chart.chartWidth,
                chartHeight: chart.chartHeight
              });
            }
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[420px] chart-container">
      <style jsx>{`
        .chart-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .chart-container :global(.highcharts-legend) {
          display: block !important;
        }
        @media (max-width: 630px) {
          .chart-container :global(.highcharts-legend) {
            display: none !important;
          }
        }
      `}</style>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        containerProps={{
          style: { width: '100%', height: '100%', position: 'relative' },
        }}
      />
    </div>
  );
}

// Export as dynamic component with SSR disabled
const RadarScatterByClass = dynamic(
  () => Promise.resolve(RadarScatterByClassComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] sm:h-[320px] md:h-[420px] flex items-center justify-center text-white">
        Loading chart...
      </div>
    ),
  }
);

export default RadarScatterByClass;
