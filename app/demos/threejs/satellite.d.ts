// Describe the satellite.js library since there's no type defs
declare module 'satellite.js' {
  // Satellite record containing orbital elements
  export interface SatRec {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface PositionAndVelocity {
    position: { x: number; y: number; z: number } | false;
    velocity: { x: number; y: number; z: number } | false;
  }

  // Turn TLE lines into a satellite record
  export function twoline2satrec(line1: string, line2: string): SatRec;

  // Calculate satellite position at given time
  export function propagate(satrec: SatRec, date: Date): PositionAndVelocity;
}
