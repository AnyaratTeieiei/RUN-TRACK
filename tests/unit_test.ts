import {
  calculateHaversineDistance,
  isValidCoordinate,
  calculateTotalDistanceKm,
} from '../src/utils/distanceCalculator';
import {
  calculatePace,
  calculateAverageSpeed,
  convertMpsToKmh,
} from '../src/utils/paceCalculator';
import {
  formatTimer,
  formatTotalTime,
  formatDate,
  formatDateTime,
} from '../src/utils/timeFormatter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Testing Distance Calculations ---');
// Test Bangkok coordinates (approx 1 km apart)
// Lat 13.7563, Lon 100.5018 -> Lat 13.7653, Lon 100.5018 (approx 1000m)
const dist = calculateHaversineDistance(13.7563, 100.5018, 13.7653, 100.5018);
assert(Math.abs(dist - 1000) < 5, `Haversine distance should be ~1000m (got ${dist.toFixed(1)}m)`);

// Test Stationary Drift Rejection
const c1 = { latitude: 13.7563, longitude: 100.5018, timestamp: 1000, accuracy: 5 };
const cDrift = { latitude: 13.7563001, longitude: 100.5018001, timestamp: 2000, accuracy: 5 };
const driftValidation = isValidCoordinate(cDrift, c1);
assert(!driftValidation.isValid && driftValidation.reason === 'Stationary drift', 'Stationary drift (<1.5m) correctly rejected');

// Test GPS Jitter / Teleport Jump Rejection (> 13 m/s)
const cTeleport = { latitude: 13.8000, longitude: 100.5018, timestamp: 2000, accuracy: 5 }; // ~4.8 km jump in 1s
const jumpValidation = isValidCoordinate(cTeleport, c1);
assert(!jumpValidation.isValid && jumpValidation.reason === 'Unrealistic GPS jump', 'Unrealistic GPS teleport jump correctly rejected');

// Test Low Accuracy Rejection (> 30m)
const cLowAcc = { latitude: 13.7570, longitude: 100.5018, timestamp: 2000, accuracy: 55 };
const accValidation = isValidCoordinate(cLowAcc, c1);
assert(!accValidation.isValid && accValidation.reason === 'Low accuracy', 'Low accuracy coordinate (>30m) correctly rejected');

// Test Valid Running Step (e.g. 5m in 2 seconds = 2.5 m/s = 9 km/h)
// 0.000045 deg lat is approx 5 meters
const cValid = { latitude: 13.756345, longitude: 100.5018, timestamp: 3000, accuracy: 8 };
const validStep = isValidCoordinate(cValid, c1);
assert(validStep.isValid, 'Valid running step correctly accepted');

for (const timestamp of [c1.timestamp, c1.timestamp - 1]) {
  const staleStep = isValidCoordinate({ ...cValid, timestamp }, c1);
  assert(!staleStep.isValid && staleStep.distanceMeters === 0, 'Duplicate and older GPS timestamps do not add distance');
}

console.log('\n--- Testing Pace Calculations ---');
// 5.24 km in 1965s -> 1965 / 5.24 = 375s = 6 min 15 sec -> "6:15"
const pace = calculatePace(5.24, 1965);
assert(pace === '6:15', `Pace should be 6:15 (got ${pace})`);

// Zero distance pace
const zeroPace = calculatePace(0, 100);
assert(zeroPace === '--:--', `Zero distance pace should be --:-- (got ${zeroPace})`);

// Speed: 5.24 km in 1965s -> 5.24 / (1965/3600) = 9.599 -> 9.6 km/h
const speed = calculateAverageSpeed(5.24, 1965);
assert(speed === 9.6, `Average speed should be 9.6 km/h (got ${speed})`);

// Speed convert: 2.5 m/s -> 9.0 km/h
const speedKmh = convertMpsToKmh(2.5);
assert(speedKmh === 9.0, `2.5 m/s should convert to 9.0 km/h (got ${speedKmh})`);

console.log('\n--- Testing Time Formatters ---');
// 32 min 45 sec -> 1965s
assert(formatTimer(1965) === '32:45', `1965s should format to 32:45 (got ${formatTimer(1965)})`);
// 1h 5m 23s -> 3923s
assert(formatTimer(3923) === '01:05:23', `3923s should format to 01:05:23 (got ${formatTimer(3923)})`);
// Total time format
assert(formatTotalTime(23100) === '6h 25m', `23100s should format to 6h 25m (got ${formatTotalTime(23100)})`);

console.log('\nAll unit tests passed successfully! 🎉');
