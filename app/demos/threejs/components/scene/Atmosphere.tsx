import React, { useRef } from 'react';
import * as THREE from 'three';

export function Atmosphere() {
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
