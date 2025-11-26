import * as THREE from 'three';

// Constants
export const EARTH_RADIUS_KM = 6371;
export const EARTH_SCALE = 1 / EARTH_RADIUS_KM;

// ECI (Earth Centered Inertial) coordinate system interfaces, in km
export interface ECIPosition {
  x: number;
  y: number;
  z: number;
}

// All in three.js units
export interface ThreeJSPosition {
  x: number;
  y: number;
  z: number;
}

// Latitude, longitude and altitude in degress and km above sea level
export interface GeodeticPosition {
  lat: number;
  lng: number;
  alt: number;
}

/**
 * Convert ECI coordinates to Three.js coordinate system
 */
export function eciToThreeJS(eci: ECIPosition): ThreeJSPosition {
  return {
    // Left/Right stays the same
    x: eci.x * EARTH_SCALE,

    // Up/Down: ECI Z becomes Three.js Y
    y: eci.z * EARTH_SCALE,

    // Forward/Back: ECI Y becomes Three.js -Z
    z: -eci.y * EARTH_SCALE,
  }
}

/**
 * Convert ECI coordinates to latitude, longitude, altitude
 */
export function eciToGeodetic(eci: ECIPosition): GeodeticPosition {
  const distance = Math.sqrt(eci.x * eci.x + eci.y * eci.y + eci.z * eci.z);

  return {
    lat: Math.asin(eci.z / distance) * (180 / Math.PI),
    lng: Math.atan2(eci.y, eci.x) * (180 / Math.PI),
    alt: distance - EARTH_RADIUS_KM,
  };
}

/**
 * Set Three.js mesh position from ECI coordinates
 */
export function setSatellitePosition(mesh: THREE.Mesh, eci: ECIPosition): GeodeticPosition {
  const threeJS = eciToThreeJS(eci);
  const geodetic = eciToGeodetic(eci);

  mesh.position.set(threeJS.x, threeJS.y, threeJS.z);
  return geodetic;
}
