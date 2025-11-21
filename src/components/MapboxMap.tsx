'use client';

import { Map, Source, Layer, NavigationControl, MapRef, useControl, IControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRef, useState, useEffect } from 'react';
import type { Map as MapboxMapType, LngLatBoundsLike } from 'mapbox-gl';
import { createRoot } from 'react-dom/client';
import LayerSwitcher from './LayerSwitcher';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Props for the LayerSwitcher component
interface LayerSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

// Wrapper class to use LayerSwitcher as a map control
class LayerSwitcherControl implements IControl {
  private _map: MapboxMapType | null = null;
  private _container: HTMLDivElement;
  private _root: ReturnType<typeof createRoot> | null = null;
  private _props: LayerSwitcherProps;

  constructor(props: LayerSwitcherProps) {
    this._props = props;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
  }

  onAdd(map: MapboxMapType) {
    this._map = map;
    this._root = createRoot(this._container);
    this._root.render(<LayerSwitcher {...this._props} />);
    return this._container;
  }

  onRemove() {
    // Defer unmounting to avoid race conditions with React's render cycle
    setTimeout(() => {
      this._root?.unmount();
    }, 0);
    this._container.remove();
    this._map = null;
  }
}

// Custom hook component to use the control
function LayerSwitcherControlWrapper(props: LayerSwitcherProps) {
  useControl(() => new LayerSwitcherControl(props), {
    position: 'top-right'
  });
  return null;
}


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

// Helper to calculate the bounding box of a GeoJSON object
function getBounds(geojson: any): LngLatBoundsLike | null {
  let bounds: [number, number, number, number] | null = null;

  function updateBounds(coords: number[]) {
    const [lng, lat] = coords;
    if (!bounds) {
      bounds = [lng, lat, lng, lat];
    } else {
      bounds[0] = Math.min(bounds[0], lng);
      bounds[1] = Math.min(bounds[1], lat);
      bounds[2] = Math.max(bounds[2], lng);
      bounds[3] = Math.max(bounds[3], lat);
    }
  }

  function processCoordinates(coords: any) {
    if (!coords || !Array.isArray(coords)) return;

    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        updateBounds(coords);
        return;
    }

    for (const item of coords) {
        processCoordinates(item);
    }
  }

  try {
    if (!geojson) return null;
    if (geojson.type === 'FeatureCollection') {
      for (const feature of geojson.features) {
        if (feature.geometry && feature.geometry.coordinates) {
          processCoordinates(feature.geometry.coordinates);
        }
      }
    } else if (geojson.type === 'Feature') {
      if (geojson.geometry && geojson.geometry.coordinates) {
        processCoordinates(geojson.geometry.coordinates);
      }
    } else if (geojson.coordinates) { // This could be a Geometry object
      processCoordinates(geojson.coordinates);
    }
  } catch (e) {
    console.error("Could not parse GeoJSON for bounds", e);
    return null;
  }

  return bounds ? [[bounds[0], bounds[1]], [bounds[2], bounds[3]]] : null;
}

export default function MapboxMap({ geojson }: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('mapbox://styles/mapbox/outdoors-v12');

  const onMapLoad = () => {
    if (mapRef.current) {
      mapRef.current.setLanguage('ru');
      setMapLoaded(true);
    }
  };

  useEffect(() => {
    if (isMapLoaded && mapRef.current && geojson) {
      const bounds = getBounds(geojson);
      if (bounds) {
        const isPoint = bounds[0][0] === bounds[1][0] && bounds[0][1] === bounds[1][1];
        if (isPoint) {
          mapRef.current.flyTo({ center: [bounds[0][0], bounds[0][1]], zoom: 12 });
        } else {
          mapRef.current.fitBounds(bounds, { padding: 40, duration: 1000 });
        }
      } else {
        mapRef.current.flyTo({ center: [37.6173, 55.7558], zoom: 5 });
      }
    } else if (isMapLoaded && mapRef.current) {
        mapRef.current.flyTo({ center: [37.6173, 55.7558], zoom: 5 });
    }
  }, [geojson, isMapLoaded]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 37.6173,
        latitude: 55.7558,
        zoom: 5
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={currentStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      onLoad={onMapLoad}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
    >
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />
      <Source id="route" type="geojson" data={geojson}>
        <Layer {...routeLayer} />
        <Layer {...pointLayer} />
        <Layer {...pointLabelLayer} />
      </Source>
      <NavigationControl position="top-right" />
      <LayerSwitcherControlWrapper
        currentStyle={currentStyle}
        onStyleChange={setCurrentStyle}
      />
    </Map>
  );
}
