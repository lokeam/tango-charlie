import React from 'react';

// Satellite Info Panel Component
export interface SatelliteInfoPanelProps {
  isVisible: boolean;
  satelliteName: string;
  position: { lat: number, lng: number; alt: number } | null;
  onClose: () => void;
}

export function SatelliteInfoPanel({
  isVisible,
  satelliteName,
  position,
  onClose,
}: SatelliteInfoPanelProps) {
  if (!isVisible || !position) return null;

  return (
    <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-green-500 min-w-[250px] z-10">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-green-400">{satelliteName}</h3>
        <button
        onClick={onClose}
        className="text-gray-400 hover:text-white text-lg leading-none"
        >
        ×
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {/*.= Latitude, Longitude, Altitude */}
        <div className="flex justify-between">
          <span className="text-gray-300">Latitude:</span>
          <span>{position.lat.toFixed(2)}°</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Longitude:</span>
          <span>{position.lng.toFixed(2)}°</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Altitude:</span>
          <span>{position.alt.toFixed(0)} km</span>
        </div>

        <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700">Real-time orbital position</div>
      </div>
    </div>
 );
}
