import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { AppMapViewProps, AppMapViewRef } from './AppMapView.types';
import { GPSCoordinate } from '../../types/run';

declare global {
  interface Window {
    L: any;
  }
}

let leafletScriptLoaded = false;
let leafletLoadingPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletScriptLoaded && window.L) return Promise.resolve();
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve, reject) => {
    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (window.L) {
      leafletScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      leafletScriptLoaded = true;
      resolve();
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return leafletLoadingPromise;
}

export const AppMapView = forwardRef<AppMapViewRef, AppMapViewProps>(
  (
    {
      currentCoord,
      routeCoordinates = [],
      showStartMarker = true,
      showFinishMarker = false,
      showUserMarker = true,
      onTouchStart,
      style,
      initialCenter = { latitude: 13.7563, longitude: 100.5018 },
      interactive = true,
    },
    ref
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const leafletMapRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const startMarkerRef = useRef<any>(null);
    const finishMarkerRef = useRef<any>(null);

    const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);
    const containerIdRef = useRef<string>(`leaflet-map-${Math.random().toString(36).substring(2, 9)}`);

    // Imperative methods for controlling map
    useImperativeHandle(ref, () => ({
      animateCamera: (options) => {
        if (leafletMapRef.current) {
          leafletMapRef.current.setView(
            [options.center.latitude, options.center.longitude],
            options.zoom ?? 17,
            { animate: true }
          );
        }
      },
      fitToCoordinates: (coords: GPSCoordinate[]) => {
        if (leafletMapRef.current && coords.length > 0 && window.L) {
          const latLngs = coords.map((c) => [c.latitude, c.longitude]);
          const bounds = window.L.latLngBounds(latLngs);
          leafletMapRef.current.fitBounds(bounds, {
            padding: [40, 40],
            animate: true,
          });
        }
      },
    }));

    // 1. Initialize Leaflet library
    useEffect(() => {
      loadLeaflet()
        .then(() => setIsLeafletReady(true))
        .catch((err) => console.error('Failed to load Leaflet:', err));
    }, []);

    // 2. Initialize Leaflet Map instance
    useEffect(() => {
      if (!isLeafletReady || !mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L;
      if (!L) return;

      const lat = currentCoord ? currentCoord.latitude : initialCenter.latitude;
      const lon = currentCoord ? currentCoord.longitude : initialCenter.longitude;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 16,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      });

      // Sporty Dark Matter CartoDB Basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      map.on('dragstart', () => {
        if (onTouchStart) onTouchStart();
      });

      leafletMapRef.current = map;

      return () => {
        map.remove();
        leafletMapRef.current = null;
      };
    }, [isLeafletReady]);

    // 3. Synchronize Route Polyline
    useEffect(() => {
      if (!leafletMapRef.current || !window.L) return;
      const L = window.L;
      const map = leafletMapRef.current;

      const latLngs = routeCoordinates.map((c) => [c.latitude, c.longitude]);

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latLngs, {
          color: '#10B981',
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latLngs);
      }

      // Update Start Marker
      if (showStartMarker && routeCoordinates.length > 0) {
        const start = routeCoordinates[0];
        if (!startMarkerRef.current) {
          startMarkerRef.current = L.circleMarker([start.latitude, start.longitude], {
            radius: 7,
            color: '#FFFFFF',
            weight: 2,
            fillColor: '#3B82F6',
            fillOpacity: 1,
          })
            .bindTooltip('Start Point')
            .addTo(map);
        } else {
          startMarkerRef.current.setLatLng([start.latitude, start.longitude]);
        }
      }

      // Update Finish Marker
      if (showFinishMarker && routeCoordinates.length > 1) {
        const finish = routeCoordinates[routeCoordinates.length - 1];
        if (!finishMarkerRef.current) {
          finishMarkerRef.current = L.circleMarker([finish.latitude, finish.longitude], {
            radius: 8,
            color: '#FFFFFF',
            weight: 2,
            fillColor: '#EF4444',
            fillOpacity: 1,
          })
            .bindTooltip('Finish Point')
            .addTo(map);
        } else {
          finishMarkerRef.current.setLatLng([finish.latitude, finish.longitude]);
        }
      }
    }, [routeCoordinates, showStartMarker, showFinishMarker]);

    // 4. Synchronize Current User Position Marker
    useEffect(() => {
      if (!leafletMapRef.current || !window.L || !currentCoord || !showUserMarker) return;
      const L = window.L;
      const map = leafletMapRef.current;

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker([currentCoord.latitude, currentCoord.longitude], {
          radius: 9,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#10B981',
          fillOpacity: 0.95,
        })
          .bindTooltip('Current Position')
          .addTo(map);
      } else {
        userMarkerRef.current.setLatLng([currentCoord.latitude, currentCoord.longitude]);
      }
    }, [currentCoord, showUserMarker]);

    return (
      <View style={[styles.container, style]}>
        <div
          id={containerIdRef.current}
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
});
