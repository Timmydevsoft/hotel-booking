import { isValidStay } from '../lib/dates';

/**
 * Shared input validation for every service operation.
 * Each helper returns an error message (or null when the value is valid),
 * so services can short-circuit with a human-readable `{ ok: false, error }`.
 */

/** True when the value is a non-empty string. */
export function validateRequired(value: string | undefined, label: string): string | null {
  if (!value || !value.trim()) return `${label} is required.`;
  return null;
}

/** Basic email shape check (no exotic addresses, plenty for a demo app). */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validates a stay range. Both dates must be present together;
 * when both are absent the check passes (used by open-ended searches).
 */
export function validateStayDates(
  checkIn: string | undefined,
  checkOut: string | undefined,
): string | null {
  if (!checkIn && !checkOut) return null;
  if (!checkIn || !checkOut) return 'Please provide both check-in and check-out dates.';
  if (!isValidStay(checkIn, checkOut)) return 'Check-out must be after check-in.';
  return null;
}

/** Guests must be a positive whole number when provided. */
export function validateGuests(guests: number | undefined): string | null {
  if (guests === undefined || guests === null) return null;
  if (!Number.isInteger(guests) || guests < 1) return 'Please enter at least one guest.';
  return null;
}
