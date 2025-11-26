import React from 'react';
import { Stars, OrbitControls } from '@react-three/drei';
import { Earth } from './Earth';
import { ISSSatellite } from '../satellites/ISSSatellite';

interface SceneProps {
  onSatelliteSelect: (satellite: { name: string, position: { lat: number, lng: number, alt: number } }) => void;
}

// Scene component containing all 3D
export function Scene({ onSatelliteSelect }: SceneProps) {
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
        args={["#87CEEB", "#362d1a", 0.6]}  // [skyColor, groundColor, intensity]
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
      <ISSSatellite onSelect={onSatelliteSelect} />

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
