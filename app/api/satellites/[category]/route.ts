import { NextRequest, NextResponse } from 'next/server';

// CeleStrak TLE data sources - Updated to new query API (2025)
// Reference: https://celestrak.com/columns/v04n03/
const CELESTRAK_SOURCES = {
  starlink: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=STARLINK&FORMAT=TLE',
  stations: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=TLE',
  gps: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=GPS-OPS&FORMAT=TLE',
  geo: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=GEO&FORMAT=TLE',
  debris: 'https://celestrak.org/NORAD/elements/gp.php?NAME=COSMOS%202251%20DEB&FORMAT=TLE'
} as const;

type SatelliteCategory = keyof typeof CELESTRAK_SOURCES;

// Simple in-memory cache (in production, use Redis or similar)
interface SatelliteData {
  name: string;
  line1: string;
  line2: string;
  noradId: number;
}

const cache = new Map<string, { data: SatelliteData[]; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Translate TLE (Two-Line Element Set) data into structured format
 *
 * TLE Format References:
 * - Main reference: https://celestrak.com/columns/v04n03/ (Dr. T.S. Kelso)
 * - Formatting details: https://celestrak.com/NORAD/documentation/tle-fmt.php
 * - Wikipedia: https://en.wikipedia.org/wiki/Two-line_element_set
 *
 * TLE Structure (per Celestrak specification):
 * Line 0: Satellite name
 * Line 1: Catalog number, epoch, orbital decay, drag term, ephemeris type
 * Line 2: Inclination, right ascension, eccentricity, perigee, mean anomaly, mean motion
 *
 * Field Positions (1-indexed as per NORAD specification):
 * Line 1, cols 3-7:   Satellite catalog number
 * Line 1, cols 19-32: Epoch (year and day of year)
 * Line 2, cols 9-16:  Inclination (degrees)
 * Line 2, cols 53-63: Mean motion (revolutions per day)
 */
function parseTLEData(tleText: string) {

  // trim lines and break into an array of satellite data
  const lines = tleText.trim().split('\n');
  const satellites = [];


  // Process satellite in groups of 3 lines (with the name + 2 TLE lines)
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      // Line 1: Sat name
      const name = lines[i].trim();

      // Line 2: Orbital elements part 1
      const line1 = lines[i + 1].trim();

      // Line 3: Orbital elements part 2
      const line2 = lines[i + 2].trim();

      // Basic validation: Ensure CeleStrak data doesn't have corrupted data, comments and empty lines
      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        satellites.push({
          name,
          line1,
          line2,
          noradId: parseInt(line1.substring(2, 7))
        });
      }
    }
  }

  return satellites;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    // Debug logging
    console.log('Received category:', category);
    console.log('Available categories:', Object.keys(CELESTRAK_SOURCES));

    // Type guard: Check if category is one of 5 valid keys
    if (!(category in CELESTRAK_SOURCES)) {
      console.log('Invalid category received:', category);
      return NextResponse.json(
        { error: `Invalid satellite category. Valid options: ${Object.keys(CELESTRAK_SOURCES).join(', ')}` },
        { status: 400 }
      );
    }

    // Now TypeScript knows category is a valid key
    const typedCategory = category as SatelliteCategory;
    console.log('Using valid category:', typedCategory);

    // Create a unique cache key for each category
    const cacheKey = `satellites_${typedCategory}`;

    // Check we have this data stored in memory
    const cached = cache.get(cacheKey);

    // If data is less than 24hrs old, return the cached version
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Serving cached data for ${typedCategory}`);
      return NextResponse.json({
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp
      });
    }

    // Fetch fresh data from CeleStrak
    console.log(`Fetching fresh TLE data for ${typedCategory}`);
    const response = await fetch(CELESTRAK_SOURCES[typedCategory]);

    if (!response.ok) {
      throw new Error(`Failed to fetch TLE data: ${response.statusText}`);
    }

    const tleText = await response.text();
    const satellites = parseTLEData(tleText);

    // Store fresh data in cache for next 24hrs, return sat data as JSON
    cache.set(cacheKey, {
      data: satellites,
      timestamp: Date.now()
    });

    return NextResponse.json({
      data: satellites,
      cached: false,
      timestamp: Date.now(),
      count: satellites.length
    });

    // Gracefully handle errors
  } catch (error) {
    console.error('Error fetching satellite data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellite data' },
      { status: 500 }
    );
  }
}