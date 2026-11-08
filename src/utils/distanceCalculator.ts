import type { GPSCoordinate } from '../types/run';

const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters
const MAX_RUNNING_SPEED_MPS = 13.0; // ~46.8 km/h (faster than Usain Bolt's max sprint)
const MIN_DISTANCE_THRESHOLD_METERS = 1.5; // Threshold to prevent stationary GPS drift
const MAX_ACCEPTABLE_ACCURACY_METERS = 30; // Max acceptable GPS accuracy radius in meters

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(phi1) * Math.cos(phi2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Validates whether a new coordinate is physically sound and accurate enough to be accepted.
 * Filters out low accuracy points and unnatural GPS teleport jumps.
 */
export function isValidCoordinate(
  newCoord: GPSCoordinate,
  prevCoord: GPSCoordinate | null
): { isValid: boolean; reason?: string; distanceMeters: number } {
  // Check accuracy threshold
  if (
    newCoord.accuracy !== null &&
    newCoord.accuracy !== undefined &&
    newCoord.accuracy > MAX_ACCEPTABLE_ACCURACY_METERS
  ) {
    return {
      isValid: false,
      reason: 'Low accuracy',
      distanceMeters: 0,
    };
  }

  // If this is the first coordinate, it is valid as the starting point
  if (!prevCoord) {
    return { isValid: true, distanceMeters: 0 };
  }

  const timeDeltaSeconds = (newCoord.timestamp - prevCoord.timestamp) / 1000;
  if (timeDeltaSeconds <= 0) {
    return { isValid: false, reason: 'Out-of-order GPS timestamp', distanceMeters: 0 };
  }

  const distanceMeters = calculateHaversineDistance(
    prevCoord.latitude,
    prevCoord.longitude,
    newCoord.latitude,
    newCoord.longitude
  );

  // Filter out tiny micro-jitter when standing still (drift)
  if (distanceMeters < MIN_DISTANCE_THRESHOLD_METERS) {
    return {
      isValid: false,
      reason: 'Stationary drift',
      distanceMeters: 0,
    };
  }

  // Check time delta and calculate implied velocity
  const impliedSpeedMps = distanceMeters / timeDeltaSeconds;
  if (impliedSpeedMps > MAX_RUNNING_SPEED_MPS) {
    return {
      isValid: false,
      reason: 'Unrealistic GPS jump',
      distanceMeters: 0,
    };
  }

  return { isValid: true, distanceMeters };
}

/**
 * Calculates total distance of an array of coordinates in kilometers.
 */
export function calculateTotalDistanceKm(coordinates: GPSCoordinate[]): number {
  if (coordinates.length < 2) return 0;

  let totalMeters = 0;
  for (let i = 1; i < coordinates.length; i++) {
    totalMeters += calculateHaversineDistance(
      coordinates[i - 1].latitude,
      coordinates[i - 1].longitude,
      coordinates[i].latitude,
      coordinates[i].longitude
    );
  }

  return totalMeters / 1000;
}
