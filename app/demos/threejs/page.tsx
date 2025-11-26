'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

// Custom Layout Components
import { PageMain } from '@/components/layout/page-main';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Stats } from '@react-three/drei';

// Constants
const EARTH_DAY_TEXTURE = '/earth_atmos_2048_min.jpg';
const DEMO_NOTICE = 'This visualization uses publically available orbital data. Not for operational use.'

// ISS Satellite Tracker Component
function ISSSatellite() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [issData, setIssData] = useState<any>(null);
  const [satrec, setSatrec] = useState<any>(null);

  // Fetch ISS data from our API
  useEffect(() => {
    const fetchISSData = async () => {
      try {
        const response = await fetch('/api/satellites/stations');
        const data = await response.json();

        // Find ISS in the stations data
        const iss = data.data.find((sat: any) => sat.name === 'ISS (ZARYA)');
        if (iss) {
          console.log('Found ISS:', iss);
          setIssData(iss);

          // Create satellite record from TLE data
          const satRec = satellite.twoline2satrec(iss.line1, iss.line2);
          setSatrec(satRec);
        }
      } catch (error) {
        console.error('Failed to fetch ISS data:', error);
      }
    };

    fetchISSData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchISSData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update ISS position every frame
  useFrame(() => {
    if (!meshRef.current || !satrec) return;

    // Calculate current position
    const now = new Date();
    const positionAndVelocity = satellite.propagate(satrec, now);

    if (positionAndVelocity.position && typeof positionAndVelocity.position === 'object') {
      const { x, y, z } = positionAndVelocity.position;

      // Debug: Log position occasionally
      if (Math.random() < 0.01) { // Log ~1% of frames
        console.log('ISS Raw position (km):', { x, y, z });
        console.log('Distance from Earth center:', Math.sqrt(x*x + y*y + z*z));
      }

      // Convert from km to Three.js units
      // Earth radius = 1 unit, ISS altitude ≈ 400km above surface
      // So ISS should be at radius ≈ 1.06 units
      const earthRadiusKm = 6371;
      const scale = 1 / earthRadiusKm;

      // Set position (ECI "space" coordinates, adjust for Three.js)

      // Left/Right stays the same
      const newX = x * scale;

      // Up/Down: ECI's Z becomes Three.js Y
      const newY = z * scale;

      // Forward/Back: ECI's Y becomes Three.js -Z
      const newZ = -y * scale;

      meshRef.current.position.set(newX, newY, newZ);

      // Debug: Log final position occasionally
      if (Math.random() < 0.01) {
        console.log('ISS Three.js position:', { x: newX, y: newY, z: newZ });
        console.log('Distance from origin:', Math.sqrt(newX*newX + newY*newY + newZ*newZ));
      }
    } else {
      console.warn('Invalid ISS position data:', positionAndVelocity);
    }
  });

  if (!issData) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
  );
}

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
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.1}
        />
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

      {/* Realistic lighting setup */}
      {/* Hemisphere light simulates sky + ground bounce lighting */}
      <hemisphereLight
        skyColor="#87CEEB"     // Sky blue
        groundColor="#362d1a"  // Dark brown (earth/ground)
        intensity={0.6}
      />

      {/* Directional light simulates the sun */}
      <directionalLight
        position={[10, 5, 5]}   // Sun position (from upper right)
        intensity={2}           // Bright sun
        color="#FFF8DC"         // Warm sunlight color
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Subtle rim light from opposite side (simulates reflected light) */}
      <directionalLight
        position={[-5, -2, -5]}  // Opposite side of main sun
        intensity={0.3}          // Much dimmer
        color="#4169E1"          // Cool blue (space/reflected light)
      />

      {/* Earth placeholder */}
      <Earth />

      {/* ISS Satellite */}
      <ISSSatellite />

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

            {/* Performance stats - only in development */}
            {process.env.NODE_ENV === 'development' && <Stats />}
          </Canvas>
        </div>
      </div>
    </PageMain>
  )
}
