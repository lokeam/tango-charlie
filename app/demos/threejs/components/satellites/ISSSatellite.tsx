import React, { useRef, useState, useEffect } from 'react';

// Three.js + fiber
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { useFrame } from '@react-three/fiber';

// Utils
import { setSatellitePosition } from '@/app/demos/threejs/utils/coordinates';

export interface ISSSatelliteProps {
  onSelect: (satellite: { name: string, position: { lat: number, lng: number, alt: number } }) => void;
}

// Satellite data interface
interface SatelliteData {
  name: string;
  line1: string;
  line2: string;
  noradId: string;
}

export function ISSSatellite({ onSelect }: ISSSatelliteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [issData, setIssData] = useState<SatelliteData | null>(null);
  const [satrec, setSatrec] = useState<satellite.SatRec | null>(null);

  // Click + hover detection
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number, lng: number, alt: number} | null>(null);

  // Fetch ISS data from our API
  useEffect(() => {
    const fetchISSData = async () => {
      try {
        const response = await fetch('/api/satellites/stations');
        const data = await response.json();

        // Find ISS in the stations data
        const iss = data.data.find((sat: SatelliteData) => sat.name === 'ISS (ZARYA)');
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

      // Debug: occasionally log position
      if (Math.random() < 0.01) { // Log ~1% of frames
        console.log('ISS Raw position (km):', { x, y, z });
        console.log('Distance from Earth center:', Math.sqrt(x*x + y*y + z*z));
      }

      // Grab geodetic coordinate conversations after doing the math in
      const geodetic = setSatellitePosition(meshRef.current, { x, y, z });
      setCurrentPosition(geodetic);

      // Debug: Occassionally log final position
      if (Math.random() < 0.01) {
        console.log('ISS Three.js position:', meshRef.current.position);
        console.log('ISS Lat/Lon/Alt:', geodetic);
      }
    } else {
      console.warn('Invalid ISS position data:', positionAndVelocity);
    }
  });

  if (!issData) return null;

  return (
    <mesh
      ref={meshRef}
      onClick={() => {
        setIsClicked(!isClicked);
        if (currentPosition && issData) {
          onSelect({
            name: issData.name,
            position: currentPosition
          })
        }
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <sphereGeometry args={[isHovered ? 0.07 : 0.05, 16, 16]} />
      <meshStandardMaterial
        color={isHovered ? "#00ffff" : "#00ff00"}
        emissive={isHovered ? "#006666" : "#004400"}
        emissiveIntensity={isHovered ? 0.8 : 0.5}
      />
    </mesh>
  );
}
