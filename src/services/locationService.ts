import * as Location from 'expo-location';
import { GPSCoordinate } from '../types/run';

export const locationService = {
  /**
   * Requests foreground location permissions from the user.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.warn('Error requesting location permissions:', error);
      return false;
    }
  },

  /**
   * Checks current permission status without prompting.
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.warn('Error checking location permissions:', error);
      return false;
    }
  },

  /**
   * Checks if device GPS / Location Services are toggled ON.
   */
  async isGPSEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.warn('Error checking GPS services status:', error);
      return false;
    }
  },

  /**
   * Obtains a one-time high accuracy fix for initial map centering.
   */
  async getCurrentPosition(): Promise<GPSCoordinate | null> {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude,
        accuracy: loc.coords.accuracy,
        speed: loc.coords.speed,
        timestamp: loc.timestamp,
      };
    } catch (error) {
      console.warn('Error fetching current position:', error);
      return null;
    }
  },

  /**
   * Starts high-precision real-time GPS tracking using Location.watchPositionAsync.
   * Returns the LocationSubscription so the caller can remove it on pause/finish.
   */
  async watchPosition(
    onLocation: (coordinate: GPSCoordinate) => void,
    onError?: (error: any) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // sample every 1000ms
          distanceInterval: 1, // sample every 1 meter movement
        },
        (location) => {
          const coord: GPSCoordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };
          onLocation(coord);
        }
      );
      return subscription;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  },
};
