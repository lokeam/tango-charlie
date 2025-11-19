
import React from "react";
import { SparklesCore } from "@/components/sparkles";


export default function Home() {
  return (
    <div className="flex items-center justify-center bg-black font-sans">
      <main className="flex min-h-[calc(100vh-10rem)] w-full max-w-3xl flex-col py-24 md:py-48 bg-black sm:items-start">
        <div className="h-160 w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center text-white relative z-20 pb-6">
            Hotel Charlie
          </h1>
          <p className="text-white text-center text-lg pb-2">
            A small showcase of the Highcharts visualization and charting library.
          </p>
          <p className="text-white text-center text-lg pb-5">
            Serves pre-processed vehicle data and is simulated to look like radar detections
          </p>
          <p className="text-white text-center text-lg pb-5 md:pb-2">
            Click the Charts Link at the top to continue
          </p>
          <div className="w-130 md:w-260 h-96 relative pb-28">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Core component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={300}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-black mask-[radial-gradient(350px_400px_at_top,transparent_20%,white)]"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
