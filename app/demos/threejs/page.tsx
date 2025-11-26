'use client';

import React, { useState, Suspense } from 'react';

// React Three + fiber
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';

// Custom Layout Components
import { PageMain } from '@/components/layout/page-main';
import { LoadingFallback } from '@/app/demos/threejs/components/ui/LoadingFallback';

// Custom Components
import { SatelliteInfoPanel } from '@/app/demos/threejs/components/ui/SatelliteInfoPanel';

// Scene Components
import { Scene } from '@/app/demos/threejs/components/scene/Scene';


export default function ThreeJSPage() {
  // State for satellite panel
  const [selectedSatellite, setSelectedSatellite] = useState<{
    name: string,
    position: { lat: number, lng: number, alt: number } | null
  } | null>(null);

  return (
    <PageMain>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            Globe POC
          </h1>
        </header>

        <div className="w-full h-[calc(100vh-8rem)] bg-black rounded-md border border-slate-800 overflow-hidden relative">
          <Canvas
            camera={{
              position: [5, 5, 5],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              alpha: false,
            }}
          >
            <Suspense fallback={null}>
              <Scene onSatelliteSelect={setSelectedSatellite} />
            </Suspense>

            {/* Performance stats - only in development */}
            {process.env.NODE_ENV === 'development' && <Stats />}
          </Canvas>

          {/* Satellite Info Panel */}
          <SatelliteInfoPanel
            isVisible={!!selectedSatellite}
            satelliteName={selectedSatellite?.name || ''}
            position={selectedSatellite?.position || null}
            onClose={() => setSelectedSatellite(null)}
          />
        </div>
      </div>
    </PageMain>
  );
}
