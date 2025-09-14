'use client';

import { Map, Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRef } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  geojson: any; // Allow any valid GeoJSON object
}

// --- Layer Styles ---
const routeLayer: import('react-map-gl').LineLayer = {
  id: 'route',
  type: 'line',
  source: 'route',
  filter: ['==', ['geometry-type'], 'LineString'],
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#3887be',
    'line-width': 5,
    'line-opacity': 0.75
  }
};

const pointLayer: import('react-map-gl').CircleLayer = {
  id: 'points',
  type: 'circle',
  source: 'route',
  filter: ['==', ['geometry-type'], 'Point'],
  paint: {
    'circle-radius': 6,
    'circle-color': '#B42222',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};

const pointLabelLayer: import('react-map-gl').SymbolLayer = {
  id: 'point-labels',
  type: 'symbol',
  source: 'route',
  filter: ['==', ['geometry-type'], 'Point'],
  layout: {
    'text-field': ['get', 'name'], // Get the 'name' property from the GeoJSON feature
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-radial-offset': 0.8,
    'text-justify': 'auto',
    'text-size': 12
  },
  paint: {
    'text-color': '#222222',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1
  }
};

// Helper to find the first coordinate
function getInitialCoords(geojson: any): { longitude: number; latitude: number } | null {
  if (!geojson) return null;
  try {
    if (geojson.type === 'FeatureCollection') {
      const firstFeature = geojson.features[0];
      if (firstFeature.geometry.type === 'LineString') {
        const [longitude, latitude] = firstFeature.geometry.coordinates[0];
        return { longitude, latitude };
      }
    } else if (geojson.type === 'Feature' && geojson.geometry.type === 'LineString') {
      const [longitude, latitude] = geojson.geometry.coordinates[0];
      return { longitude, latitude };
    } else if (geojson.type === 'LineString') {
      const [longitude, latitude] = geojson.coordinates[0];
      return { longitude, latitude };
    }
  } catch (e) {
    console.error("Could not parse GeoJSON for initial coordinates", e);
    return null;
  }
  return null;
}

export default function MapboxMap({ geojson }: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-red-500">Mapbox token is not configured.</p>
      </div>
    );
  }

  const initialCoords = getInitialCoords(geojson);

  const onMapLoad = () => {
    if (mapRef.current) {
      mapRef.current.setLanguage('ru'); // Set map labels to Russian
    }
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: initialCoords?.longitude || 37.6173,
        latitude: initialCoords?.latitude || 55.7558,
        zoom: initialCoords ? 10 : 5
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onLoad={onMapLoad}
    >
      <Source id="route" type="geojson" data={geojson}>
        <Layer {...routeLayer} />
        <Layer {...pointLayer} />
        <Layer {...pointLabelLayer} />
      </Source>
      <NavigationControl position="top-left" />
    </Map>
  );
}