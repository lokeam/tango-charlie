import React from 'react';

// React Three + fiber
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Components
import { Atmosphere } from '@/app/demos/threejs/components/scene/Atmosphere';

// Constants
import { EARTH_DAY_TEXTURE } from '@/app/demos/threejs/constants';

export function Earth() {
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