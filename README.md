**Hotel Charlie** is a showcase of data pre-processing, charting and visualization using the [Highcharts](https://www.highcharts.com) library is simulated to look like radar detections.

## Screenshots



## Technical Highlights
<details>
  <summary>🛠️ Tech Stack & Tooling</summary>

  **Frontend/Backend**
  - Next.js 16 (App Router) + React 19 + TypeScript 5
  - TailwindCSS 4 + Motion (Framer Motion successor)
  - Highcharts 12.4 with custom responsive components
  - TSParticles engine for interactive particle effects

</details>

<details>
  <summary>⚙️ Key Technical Features</summary>

  **Advanced Data Processing**
  - Mathematical projection using rotation matrices to reveal correlations as radar-style streaks
  - Node.js preprocessing pipeline transforms raw CSV into optimized chart data
  - Fisher-Yates sampling algorithm handles 10K+ data points efficiently
  - Smart normalization maps real MPG/CO2 metrics to range/doppler coordinates

  **Interactive Radar Visualizations**
  - LeoLabs-inspired radar detection aesthetics with dynamic series generation
  - Responsive chart architecture with overflow detection and safe resizing
  - Multi-format export (PNG/JPEG/PDF/SVG) with custom tooltip system
  - Mobile-optimized layouts with breakpoint-specific legend management

</details>

Hotel Charlie preprocesses vehicle data from Kaggle's [Vehicle Data](https://www.kaggle.com/datasets/brllnd/vehicle-data) dataset.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Roadmap 🏗️

**Real-Time Data Features- Currently in development (in Active Development)**
*  🔄 **Polling Demo** - Live vehicle telemetry updates with configurable intervals
*  📡 **Server-Sent Events** - Streaming data to charts
*  🌐 **WebSocket Integration** - Bidirectional real-time chart collaboration

**Analytics & Observability Pipeline**
*  � **Prometheus Metrics** - Custom instrumentation for chart interactions and API performance
*  📈 **Grafana Dashboard** - Embedded analytics showing real-time user engagement and system health
*  🐳 **Docker Compose Stack** - Complete observability setup with containerized monitoring
*  ⚡ **Event Tracking** - Frontend analytics pipeline capturing user interactions

## License
[GNU General Public License v2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)

---

**Created by [Ahn Ming Loke](https://github.com/loke)**  • [LinkedIn](https://www.linkedin.com/in/ahnmingloke/)