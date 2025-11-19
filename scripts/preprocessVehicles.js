// scripts/preprocessVehicles.js
// Preprocess vehicles.csv into chart-ready JSON files for your Next.js + Highcharts dashboard.
// Path B: uses a simple projection of real metrics to produce LeoLabs-style streaks,
// but everything is still derived from the real dataset (no hand-drawn curves).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';

// ------------------------
// Config / tuning knobs
// ------------------------

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_CSV_PATH = path.join(__dirname, '..', 'data_raw', 'vehicles.csv'); // adjust as needed
const OUTPUT_DIR = path.join(__dirname, '..', 'data'); // where JSON files will be written

const MIN_YEAR = 1985;
const CLUSTER_A_VCLASS = 'Compact Cars';

const RANGE_KM_OUT_MIN = 600;
const RANGE_KM_OUT_MAX = 1100;

const DOPPLER_OUT_MIN = -9000;
const DOPPLER_OUT_MAX = -2500;

const SNR_DB_OUT_MIN = 10;
const SNR_DB_OUT_MAX = 18;

const TIME_STEP_SECONDS = 5;

const SCATTER_ALL_MAX_POINTS = 10000;
const SCATTER_CLUSTER_A_MAX_POINTS = 3000;

// --- Path B projection tuning ---
// We rotate the normalized MPG/CO2 values so correlations show up as streaks.
const ROTATION_DEGREES = 40;
const ROTATION_RADIANS = (ROTATION_DEGREES * Math.PI) / 180;
const COS_THETA = Math.cos(ROTATION_RADIANS);
const SIN_THETA = Math.sin(ROTATION_RADIANS);

// Low "SNR" points (based on fuel use) get a bit of random jitter so they look like fuzzy noise
const LEO_SNR_NOISE_THRESHOLD = 12; // below this, treat as noisier point
const LEO_RANGE_JITTER_KM = 10;     // small horizontal jitter
const LEO_DOPPLER_JITTER_MPS = 100; // small vertical jitter

// ------------------------
// Utility functions
// ------------------------

function normalize(value, inMin, inMax, outMin, outMax) {
  // Clamp
  if (value < inMin) value = inMin;
  if (value > inMax) value = inMax;

  if (inMax === inMin) {
    // Degenerate case: everything is the same, return midpoint
    return (outMin + outMax) / 2;
  }

  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

function groupBy(array, keyFn) {
  const map = new Map();
  for (const item of array) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}

function randomSample(array, maxCount) {
  if (array.length <= maxCount) return array.slice();

  // Simple Fisher–Yates shuffle + slice
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, maxCount);
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function writeJson(fileName, data) {
  const outPath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${fileName}`);
}

// Simple cluster grouping based on vehicle class “family”
function getClusterIdFromVClass(vClass) {
  const name = vClass.toLowerCase();

  if (name.includes('compact') || name.includes('subcompact')) {
    return 0;
  }
  if (name.includes('midsize') || name.includes('mid-size') || name.includes('large')) {
    return 1;
  }
  if (name.includes('suv') || name.includes('sport utility')) {
    return 2;
  }
  if (
    name.includes('van') ||
    name.includes('pickup') ||
    name.includes('truck') ||
    name.includes('minivan')
  ) {
    return 3;
  }

  return 4; // everything else
}

// ------------------------
// Main pipeline
// ------------------------

async function main() {
  console.log('Reading CSV:', INPUT_CSV_PATH);

  const rowsClean = await readAndCleanCsv(INPUT_CSV_PATH);
  console.log(`Rows after cleaning/filtering: ${rowsClean.length}`);

  if (rowsClean.length === 0) {
    console.error('No valid rows after filtering. Check MIN_YEAR and cleaning rules.');
    process.exit(1);
  }

  // 1. Compute global min/max for normalization (original axes)
  const mpgValues = rowsClean.map(r => r.comb08);
  const co2Values = rowsClean.map(r => r.co2TailpipeGpm);
  const barrelsValues = rowsClean.map(r => r.barrels08);

  const mpgMin = Math.min(...mpgValues);
  const mpgMax = Math.max(...mpgValues);

  const co2Min = Math.min(...co2Values);
  const co2Max = Math.max(...co2Values);

  const barrelsMin = Math.min(...barrelsValues);
  const barrelsMax = Math.max(...barrelsValues);

  console.log('Global ranges:');
  console.log('  comb08 (MPG):', mpgMin, '→', mpgMax);
  console.log('  co2TailpipeGpm:', co2Min, '→', co2Max);
  console.log('  barrels08:', barrelsMin, '→', barrelsMax);

  // 2. Base normalization: rangeKm, dopplerMps, snrDb
  const baseRows = rowsClean.map(row => {
    const rangeKm = normalize(
      row.comb08,
      mpgMin,
      mpgMax,
      RANGE_KM_OUT_MIN,
      RANGE_KM_OUT_MAX
    );

    const dopplerMps = normalize(
      row.co2TailpipeGpm,
      co2Min,
      co2Max,
      DOPPLER_OUT_MIN,
      DOPPLER_OUT_MAX
    );

    const snrDb = normalize(
      row.barrels08,
      barrelsMin,
      barrelsMax,
      SNR_DB_OUT_MIN,
      SNR_DB_OUT_MAX
    );

    return {
      vehicleId: row.vehicleId,
      year: row.year,
      vClass: row.vClass,
      fuelType: row.fuelType,
      make: row.make,
      model: row.model,
      comb08: row.comb08,
      co2TailpipeGpm: row.co2TailpipeGpm,
      barrels08: row.barrels08,
      rangeKm,
      dopplerMps,
      snrDb
    };
  });

  // 3. Path B: project real MPG/CO2 into a LeoLabs-style view (leoRangeKm/leoDopplerMps)
  //    We:
  //      - normalize MPG + CO2 to 0..1
  //      - recenter to -0.5..0.5
  //      - rotate the plane by ~40°
  //      - rescale back into our range/doppler axes
  //    This reveals real correlations as streaks, but does not fabricate them.

  const projectedTemp = baseRows.map(row => {
    // normalized to 0..1
    const u = (row.comb08 - mpgMin) / (mpgMax - mpgMin);
    const v = (row.co2TailpipeGpm - co2Min) / (co2Max - co2Min);

    // recenter to -0.5..0.5
    const u0 = u - 0.5;
    const v0 = v - 0.5;

    // rotate
    const xPrime = u0 * COS_THETA - v0 * SIN_THETA;
    const yPrime = u0 * SIN_THETA + v0 * COS_THETA;

    const clusterId = getClusterIdFromVClass(row.vClass);

    return {
      ...row,
      xPrime,
      yPrime,
      clusterId
    };
  });

  // find min/max of xPrime/yPrime so we can map them back into range/doppler units
  const xPrimes = projectedTemp.map(r => r.xPrime);
  const yPrimes = projectedTemp.map(r => r.yPrime);
  const xPrimeMin = Math.min(...xPrimes);
  const xPrimeMax = Math.max(...xPrimes);
  const yPrimeMin = Math.min(...yPrimes);
  const yPrimeMax = Math.max(...yPrimes);

  const allVehiclesWithLeo = projectedTemp.map(r => {
    let leoRangeKm = normalize(
      r.xPrime,
      xPrimeMin,
      xPrimeMax,
      RANGE_KM_OUT_MIN,
      RANGE_KM_OUT_MAX
    );
    let leoDopplerMps = normalize(
      r.yPrime,
      yPrimeMin,
      yPrimeMax,
      DOPPLER_OUT_MIN,
      DOPPLER_OUT_MAX
    );

    // Add a small amount of random jitter to low "SNR" points
    if (r.snrDb < LEO_SNR_NOISE_THRESHOLD) {
      leoRangeKm += (Math.random() * 2 - 1) * LEO_RANGE_JITTER_KM;
      leoDopplerMps += (Math.random() * 2 - 1) * LEO_DOPPLER_JITTER_MPS;
    }

    return {
      ...r,
      leoRangeKm,
      leoDopplerMps
    };
  });

  console.log(`allVehiclesWithLeo length: ${allVehiclesWithLeo.length}`);

  ensureOutputDir();

  // 4. Build aggregated + scatter datasets
  const aggByClass = buildAggByClass(allVehiclesWithLeo);
  writeJson('aggByClass.json', aggByClass);

  const aggByYear = buildAggByYear(allVehiclesWithLeo);
  writeJson('aggByYear.json', aggByYear);

  const forceGraph = buildForceGraph(allVehiclesWithLeo);
  writeJson('forceGraph.json', forceGraph);

  const stackedFuelByClass = buildStackedFuelByClass(allVehiclesWithLeo);
  writeJson('stackedFuelByClass.json', stackedFuelByClass);

  const scatterAll = buildScatterAll(allVehiclesWithLeo);
  writeJson('scatterAll.json', scatterAll);

  const scatterClusterA = buildScatterClusterA(allVehiclesWithLeo);
  writeJson('scatterClusterA.json', scatterClusterA);

  console.log('Preprocessing complete.');
}

// ------------------------
// CSV reading & cleaning
// ------------------------

function readAndCleanCsv(csvPath) {
  return new Promise((resolve, reject) => {
    const rowsClean = [];

    const parser = parse({
      columns: true,         // use first row as header
      skip_empty_lines: true,
      trim: true
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Map CSV columns → our internal cleaned row
        // NOTE: fuelType1 is the more descriptive label ("Regular Gasoline")
        const vehicleIdRaw = record.id;
        const yearRaw = record.year;
        const vClassRaw = record.VClass;
        const fuelTypeRaw = record.fuelType1 || record.fuelType;
        const comb08Raw = record.comb08;
        const co2TailpipeGpmRaw = record.co2TailpipeGpm;
        const barrels08Raw = record.barrels08;

        const makeRaw = record.make;
        const modelRaw = record.model;

        const vehicleId = vehicleIdRaw ? Number(vehicleIdRaw) : NaN;
        const year = yearRaw ? Number(yearRaw) : NaN;
        const comb08 = comb08Raw ? Number(comb08Raw) : NaN;
        const co2TailpipeGpm = co2TailpipeGpmRaw ? Number(co2TailpipeGpmRaw) : NaN;
        const barrels08 = barrels08Raw ? Number(barrels08Raw) : NaN;

        const vClass = vClassRaw ? String(vClassRaw).trim() : '';
        const fuelType = fuelTypeRaw ? String(fuelTypeRaw).trim() : '';

        const make = makeRaw ? String(makeRaw).trim() : '';
        const model = modelRaw ? String(modelRaw).trim() : '';

        // Basic validation & filters
        const hasValidNumbers =
          Number.isFinite(vehicleId) &&
          Number.isFinite(year) &&
          Number.isFinite(comb08) &&
          Number.isFinite(co2TailpipeGpm) &&
          Number.isFinite(barrels08);

        if (!hasValidNumbers) continue;
        if (year < MIN_YEAR) continue;
        if (comb08 <= 0 || co2TailpipeGpm <= 0 || barrels08 <= 0) continue;
        if (!vClass || !fuelType) continue;
        if (!make || !model) continue;


        rowsClean.push({
          vehicleId,
          year,
          vClass,
          fuelType,
          comb08,
          co2TailpipeGpm,
          barrels08,
          make,
          model
        });
      }
    });

    parser.on('error', err => {
      reject(err);
    });

    parser.on('end', () => {
      resolve(rowsClean);
    });

    fs.createReadStream(csvPath).pipe(parser);
  });
}

// ------------------------
// Aggregations
// ------------------------

function buildAggByClass(allVehicles) {
  const groups = groupBy(allVehicles, r => r.vClass);
  const result = [];

  for (const [vClass, rows] of groups.entries()) {
    const count = rows.length;
    const sumComb = rows.reduce((sum, r) => sum + r.comb08, 0);
    const avgComb08 = sumComb / count;

    result.push({
      vClass,
      avgComb08,
      vehicleCount: count
    });
  }

  // Sort by avgComb08 descending (or by name if you prefer)
  result.sort((a, b) => b.avgComb08 - a.avgComb08);

  return result;
}

function buildAggByYear(allVehicles) {
  const groups = groupBy(allVehicles, r => r.year);
  const result = [];

  for (const [yearStr, rows] of groups.entries()) {
    const year = Number(yearStr);
    const count = rows.length;
    const sumComb = rows.reduce((sum, r) => sum + r.comb08, 0);
    const avgComb08 = sumComb / count;

    result.push({
      year,
      avgComb08,
      vehicleCount: count
    });
  }

  // Sort by year ascending
  result.sort((a, b) => a.year - b.year);

  return result;
}

function buildForceGraph(allVehicles) {
  const vClassSet = new Set();
  const fuelTypeSet = new Set();

  for (const row of allVehicles) {
    vClassSet.add(row.vClass);
    fuelTypeSet.add(row.fuelType);
  }

  const nodes = [
    ...Array.from(vClassSet).map(vClass => ({ id: vClass, type: 'vClass' })),
    ...Array.from(fuelTypeSet).map(fuelType => ({ id: fuelType, type: 'fuelType' }))
  ];

  // Build link weights
  const linkMap = new Map(); // key: `${vClass}||${fuelType}` → count

  for (const row of allVehicles) {
    const key = `${row.vClass}||${row.fuelType}`;
    const prev = linkMap.get(key) || 0;
    linkMap.set(key, prev + 1);
  }

  const links = [];
  for (const [key, weight] of linkMap.entries()) {
    const [vClass, fuelType] = key.split('||');
    links.push({
      source: vClass,
      target: fuelType,
      weight
    });
  }

  return { nodes, links };
}

function buildStackedFuelByClass(allVehicles) {
  const result = {};

  for (const row of allVehicles) {
    const cls = row.vClass;
    const fuel = row.fuelType;

    if (!result[cls]) result[cls] = {};
    if (!result[cls][fuel]) result[cls][fuel] = 0;

    result[cls][fuel] += 1;
  }

  // Convert to chart-friendly array
  // Also gather all unique fuel types for consistent ordering
  const allFuelTypes = new Set();
  for (const cls of Object.keys(result)) {
    for (const fuel of Object.keys(result[cls])) {
      allFuelTypes.add(fuel);
    }
  }

  return {
    categories: Object.keys(result), // vehicle classes
    fuelTypes: Array.from(allFuelTypes), // fuel type series keys
    matrix: result, // raw, grouped
  };
}


// ------------------------
// Scatter datasets
// ------------------------

function buildScatterAll(allVehicles) {
  const sampled = randomSample(allVehicles, SCATTER_ALL_MAX_POINTS);

  // Include both the original (rangeKm/dopplerMps) and projected (leoRangeKm/leoDopplerMps) axes,
  // plus clusterId, so the frontend can choose which to plot.
  return sampled.map(row => ({
    vehicleId: row.vehicleId,
    year: row.year,
    vClass: row.vClass,
    fuelType: row.fuelType,
    make: row.make,
    model: row.model,
    comb08: row.comb08,
    co2TailpipeGpm: row.co2TailpipeGpm,
    barrels08: row.barrels08,
    rangeKm: row.rangeKm,
    dopplerMps: row.dopplerMps,
    snrDb: row.snrDb,
    leoRangeKm: row.leoRangeKm,
    leoDopplerMps: row.leoDopplerMps,
    clusterId: row.clusterId
  }));
}

function buildScatterClusterA(allVehicles) {
  const clusterA = allVehicles.filter(row => row.vClass === CLUSTER_A_VCLASS);

  if (clusterA.length === 0) {
    console.warn(`WARNING: No rows found for CLUSTER_A_VCLASS="${CLUSTER_A_VCLASS}"`);
    return [];
  }

  const sampled =
    clusterA.length > SCATTER_CLUSTER_A_MAX_POINTS
      ? randomSample(clusterA, SCATTER_CLUSTER_A_MAX_POINTS)
      : clusterA.slice();

  // Sort by CO2 as a stand-in for "time ordering" to create a smooth progression
  sampled.sort((a, b) => a.co2TailpipeGpm - b.co2TailpipeGpm);

  // Assign synthetic timeSeconds
  return sampled.map((row, index) => ({
    vehicleId: row.vehicleId,
    year: row.year,
    vClass: row.vClass,
    fuelType: row.fuelType,
    make: row.make,
    model: row.model,
    comb08: row.comb08,
    co2TailpipeGpm: row.co2TailpipeGpm,
    barrels08: row.barrels08,
    rangeKm: row.rangeKm,
    dopplerMps: row.dopplerMps,
    snrDb: row.snrDb,
    leoRangeKm: row.leoRangeKm,
    leoDopplerMps: row.leoDopplerMps,
    clusterId: row.clusterId,
    timeSeconds: index * TIME_STEP_SECONDS
  }));
}

// ------------------------
// Run
// ------------------------

main().catch(err => {
  console.error('Error during preprocessing:', err);
  process.exit(1);
});
