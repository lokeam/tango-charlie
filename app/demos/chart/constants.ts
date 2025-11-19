
// Comprehensive color mapping for vehicle classes
export const CLASS_COLORS: Record<string, string> = {
  // Cars - Blue family
  'Two Seaters': '#ff9ff3',
  'Minicompact Cars': '#CCFF66',
  'Subcompact Cars': '#feca57', // yellow-orange
  'Compact Cars': '#ff6b6b', // red-pink
  'Midsize Cars': '#1dd1a1', // teal
  'Large Cars': '#48dbfb',

  // Station Wagons - Teal family
  'Small Station Wagons': '#1dd1a1',
  'Midsize Station Wagons': '#1dd1a1',

  // Pickup Trucks - Red family
  'Small Pickup Trucks': '#E400DD',
  'Standard Pickup Trucks': '#54a0ff',

  // SUVs - Purple family (all SUV variants)
  'Sport Utility Vehicle - 2WD': '#78007F',
  'Sport Utility Vehicle - 4WD': '#F000FF',
  'Special Purpose Vehicle - 2WD': '#78007F',
  'Special Purpose Vehicle - 4WD': '#F000FF',
  'Special Purpose Vehicle': '#48004C',

  // Minivans - Orange family
  'Minivan - 2WD': '#feca57',
  'Minivan - 4WD': '#feca57',

  // Vans - Pink family (all van types)
  'Vans': '#ff9ff3',
  'Vans Passenger': '#ff9ff3',
  'Vans, Cargo Type': '#ff9ff3',
  'Vans, Passenger Type': '#ff9ff3',
};

// Function to get color with pattern matching for unmatched classes
export function getVehicleClassColor(vClass: string): string {
  // Direct lookup first
  if (CLASS_COLORS[vClass]) {
    return CLASS_COLORS[vClass];
  }

  // Pattern matching for similar vehicle types
  const lowerClass = vClass.toLowerCase();

  if (lowerClass.includes('suv') || lowerClass.includes('sport utility') || lowerClass.includes('special purpose')) {
    return '#F000FF'; // Purple for SUVs
  }
  if (lowerClass.includes('truck') || lowerClass.includes('pickup')) {
    return '#54a0ff'; // Red for trucks
  }
  if (lowerClass.includes('van')) {
    return '#feca57'; // Orange for vans
  }
  if (lowerClass.includes('wagon')) {
    return '#1dd1a1'; // Teal for wagons
  }
  if (lowerClass.includes('minivan')) {
    return '#feca57'; // Orange for minivans
  }
  if (lowerClass.includes('car') || lowerClass.includes('compact') || lowerClass.includes('sedan')) {
    return '#1dd1a1'; // Blue for cars
  }

  // Default fallback
  return OTHER_CLASS_COLOR;
}

// Color for "Other" classes
export const OTHER_CLASS_COLOR = '#c8d6e5';