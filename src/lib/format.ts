/**
 * Display formatting shared by the guest pages: prices, dates, and
 * human-readable stay summaries. Kept dependency-free so any page can
 * import exactly what it needs.
 */

/** "US$289" style price, no cents for whole values. */
export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

/** "Jun 14, 2026" from an ISO date (yyyy-mm-dd). */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "Jun 14 – Jun 19, 2026" for a stay, collapsing the shared year. */
export function formatDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return '';
  const inDate = new Date(`${checkIn}T00:00:00`);
  const outDate = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return '';
  const sameYear = inDate.getFullYear() === outDate.getFullYear();
  const inPart = inDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  const outPart = outDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${inPart} – ${outPart}`;
}

/** "2 guests" / "1 guest". */
export function formatGuests(count: number): string {
  return `${count} ${count === 1 ? 'guest' : 'guests'}`;
}

/** "3 nights" / "1 night". */
export function formatNights(count: number): string {
  return `${count} ${count === 1 ? 'night' : 'nights'}`;
}
