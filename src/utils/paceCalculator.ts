/**
 * Calculates running pace in formatted string "M:SS" or "MM:SS" (minutes and seconds per kilometer).
 * @param distanceKm Distance covered in kilometers
 * @param durationSeconds Active duration in seconds
 */
export function calculatePace(distanceKm: number, durationSeconds: number): string {
  if (!distanceKm || distanceKm < 0.02 || !durationSeconds || durationSeconds <= 0) {
    return '--:--';
  }

  const paceSecondsPerKm = durationSeconds / distanceKm;

  // Cap unrealistically slow paces (e.g. over 30 min/km)
  if (paceSecondsPerKm > 1800 || !isFinite(paceSecondsPerKm)) {
    return '--:--';
  }

  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);

  const formattedMinutes = minutes.toString();
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Calculates pace in raw seconds per kilometer (used for averaging and sorting).
 */
export function calculatePaceSeconds(distanceKm: number, durationSeconds: number): number {
  if (!distanceKm || distanceKm < 0.02 || !durationSeconds || durationSeconds <= 0) {
    return 0;
  }
  return durationSeconds / distanceKm;
}

/**
 * Calculates average speed in km/h given total distance (km) and total time (seconds).
 */
export function calculateAverageSpeed(distanceKm: number, durationSeconds: number): number {
  if (!distanceKm || distanceKm <= 0 || !durationSeconds || durationSeconds <= 0) {
    return 0.0;
  }

  const hours = durationSeconds / 3600;
  const speed = distanceKm / hours;

  return Math.round(speed * 10) / 10; // 1 decimal place
}

/**
 * Converts instantaneous speed from m/s (from GPS sensor) to km/h.
 */
export function convertMpsToKmh(speedMps?: number | null): number {
  if (!speedMps || speedMps < 0) return 0.0;
  const kmh = speedMps * 3.6;
  return Math.round(kmh * 10) / 10;
}
