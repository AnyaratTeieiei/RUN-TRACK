import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AppMapViewProps, AppMapViewRef } from './AppMapView.types';

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
    const mapRef = useRef<MapView | null>(null);

    useImperativeHandle(ref, () => ({
      animateCamera: (options) => {
        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              center: options.center,
              zoom: options.zoom ?? 17,
              pitch: options.pitch ?? 15,
              heading: options.heading ?? 0,
            },
            { duration: options.duration ?? 800 }
          );
        }
      },
      fitToCoordinates: (coords, options) => {
        if (mapRef.current && coords.length > 0) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: options?.edgePadding ?? { top: 50, right: 50, bottom: 50, left: 50 },
            animated: options?.animated ?? true,
          });
        }
      },
    }));

    const startCoord = routeCoordinates.length > 0 ? routeCoordinates[0] : null;
    const finishCoord =
      routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : null;

    return (
      <MapView
        ref={mapRef}
        style={[styles.map, style]}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        onTouchStart={onTouchStart}
        initialRegion={{
          latitude: currentCoord ? currentCoord.latitude : initialCenter.latitude,
          longitude: currentCoord ? currentCoord.longitude : initialCenter.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* Real-time GPS Polyline Route */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#10B981"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Marker */}
        {showStartMarker && startCoord && (
          <Marker coordinate={startCoord} title="Start Point">
            <View style={[styles.markerBase, styles.startMarker]}>
              <Ionicons name="flag" size={14} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Finish Marker */}
        {showFinishMarker && finishCoord && (
          <Marker coordinate={finishCoord} title="Finish Point">
            <View style={[styles.markerBase, styles.finishMarker]}>
              <Ionicons name="trophy" size={14} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Live Runner Position Marker */}
        {showUserMarker && currentCoord && (
          <Marker
            coordinate={{
              latitude: currentCoord.latitude,
              longitude: currentCoord.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            title="Current Position"
          >
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </MapView>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerBase: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startMarker: {
    backgroundColor: '#3B82F6',
  },
  finishMarker: {
    backgroundColor: '#EF4444',
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
});
