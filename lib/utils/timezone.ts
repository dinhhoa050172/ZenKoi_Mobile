/**
 * Utilities to format dates including local timezone offset.
 *
 * Use `formatISOWithLocalOffset(date)` to produce an ISO-like string with the
 * system's timezone offset, e.g. `2025-11-08T10:30:00+07:00`.
 */

export function pad(n: number, width = 2) {
  return String(n).padStart(width, '0');
}

export function formatISOWithLocalOffset(input?: Date | string): string {
  const date = input ? new Date(input) : new Date();
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // getTimezoneOffset returns minutes behind UTC (e.g., -420 for UTC+7)
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absOffset / 60));
  const offsetMins = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

export default formatISOWithLocalOffset;
