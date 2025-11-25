'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

// Custom Layout Components
import { PageGrid } from '@/components/layout/page-grid';
import { PageMain } from '@/components/layout/page-main';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

// Constants
const EARTH_DAY_TEXTURE = '/earth_atmos_2048_min.jpg';

// Atmosphere glow component using Fresnel effect
function Atmosphere() {
  const atmosphereRef = useRef(null);

  // Vertex shader - calculates the normal for Fresnel effect
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader - creates the glow using Fresnel/rim lighting
  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      // Calculate Fresnel effect (stronger at edges)
      float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
      fresnel = pow(1.0 - fresnel, 4.0); // Higher power for sharper falloff

      // Much more subtle atmosphere color and intensity
      vec3 atmosphereColor = vec3(0.4, 0.7, 1.0);
      float intensity = 0.3; // Much lower intensity

      gl_FragColor = vec4(atmosphereColor * intensity, fresnel * 0.5);
    }
  `;

  return (
    <mesh ref={atmosphereRef} scale={1.03}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Earth() {
  const texture = useLoader(TextureLoader, EARTH_DAY_TEXTURE);

  return (
    <group>
      {/* Main Earth */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Atmosphere glow */}
      <Atmosphere />
    </group>
  );
}

// Scene component containing all 3D
function Scene() {
  return (
    <>
      {/* Starfield background */}
      <Stars
        radius={300}
        depth={60}
        count={20000}
        factor={7}
        saturation={0}
        fade={true}
      />

      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
      />

      {/* Earth placeholder */}
      <Earth />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={50}
      />
    </>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-400 animate-pulse">Loading 3D Scene...</div>
    </div>
  );
}

export default function ThreeJSPage() {
  return (
    <PageMain>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            Globe POC
          </h1>
        </header>

        <div className="w-full h-[calc(100vh-8rem)] bg-black rounded-md border border-slate-800 overflow-hidden">
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
              <Scene />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </PageMain>
  )
}
