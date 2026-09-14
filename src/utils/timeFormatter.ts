/**
 * Formats seconds into a clean running timer string.
 * Example: 75 -> "01:15", 3675 -> "01:01:15"
 */
export function formatTimer(totalSeconds: number, alwaysShowHours = false): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return alwaysShowHours ? '00:00:00' : '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0 || alwaysShowHours) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats total duration for profile and summary summaries.
 * Example: 23100 -> "6h 25m", 1965 -> "32m 45s", 45 -> "45s"
 */
export function formatTotalTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Formats date into readable string, e.g. "September 14, 2026"
 */
export function formatDate(timestampOrIso: number | string): string {
  const date = new Date(timestampOrIso);
  if (isNaN(date.getTime())) return '';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Formats date and time, e.g. "September 14, 2026 • 07:30 AM"
 */
export function formatDateTime(timestampOrIso: number | string): string {
  const date = new Date(timestampOrIso);
  if (isNaN(date.getTime())) return '';

  const dateStr = formatDate(date.getTime());

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${dateStr} • ${hours}:${minStr} ${ampm}`;
}
