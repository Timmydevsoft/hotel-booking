/**
 * Date helpers shared by the data layer. All dates are ISO strings
 * (yyyy-mm-dd) which compare correctly with plain string operators.
 */

/** True when the half-open range [aStart, aEnd) overlaps [bStart, bEnd). */
export function isDateRangeOverlapping(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Number of nights between check-in and check-out (0 when invalid). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = Date.parse(checkOut) - Date.parse(checkIn);
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / 86_400_000);
}

/** True when check-out is strictly after check-in and both parse as dates. */
export function isValidStay(checkIn: string, checkOut: string): boolean {
  return !Number.isNaN(Date.parse(checkIn)) && !Number.isNaN(Date.parse(checkOut)) && checkIn < checkOut;
}

/** Local yyyy-mm-dd for a Date. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** ISO date `days` from today (negative for past). */
export function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}
