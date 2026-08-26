import { nightsBetween } from '../lib/dates';
import { useDataStore } from '../store/data';
import type {
  BookingInput,
  Reservation,
  ReservationResult,
  ReservationStatus,
} from '../types';
import { requireStaff } from './auth';
import { validateEmail, validateGuests, validateRequired, validateStayDates } from './validation';

/**
 * Reservation service: guest booking + confirmation lookups, and the
 * staff-only reservation management operations. Every staff operation
 * starts with a role guard so guest sessions are rejected.
 */

const RESERVATION_STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'CHECKED_IN',
  'CHECKED_OUT',
];

/**
 * Creates a confirmed reservation with no payment step. Validates guest
 * info, the stay range, party size, and room availability before writing.
 */
export function createReservation(input: BookingInput): ReservationResult {
  const nameError = validateRequired(input.guestName, 'Guest name');
  if (nameError) return { ok: false, error: nameError };
  const emailError = validateEmail(input.guestEmail);
  if (emailError) return { ok: false, error: emailError };
  const dateError = validateStayDates(input.checkIn, input.checkOut);
  if (dateError) return { ok: false, error: dateError };
  const guestsError = validateGuests(input.guests);
  if (guestsError) return { ok: false, error: guestsError };

  return useDataStore.getState().createReservation(input);
}

/** Looks up a reservation by ID (case-insensitive) for confirmation or lookup pages. */
export function getReservation(id: string): ReservationResult {
  const clean = id.trim().toLowerCase();
  if (!clean) return { ok: false, error: 'Please enter a reservation ID.' };
  const reservation = useDataStore
    .getState()
    .reservations.find((candidate) => candidate.id.toLowerCase() === clean);
  if (!reservation) {
    return { ok: false, error: 'No reservation was found with that ID.' };
  }
  return { ok: true, reservation };
}

/** Reservation enriched with display data for the staff dashboard. */
export interface StaffReservationView {
  reservation: Reservation;
  hotelName: string;
  roomName: string;
  nights: number;
  totalPrice: number;
}

export type ReservationsResult =
  | { ok: true; reservations: StaffReservationView[] }
  | { ok: false; error: string };

/** All reservations, newest first, enriched with hotel/room names and totals. Staff only. */
export function getAllReservations(): ReservationsResult {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { reservations, hotels, rooms } = useDataStore.getState();
  const views: StaffReservationView[] = reservations
    .map((reservation) => {
      const hotel = hotels.find((candidate) => candidate.id === reservation.hotelId);
      const room = rooms.find((candidate) => candidate.id === reservation.roomId);
      const nights = nightsBetween(reservation.checkInDate, reservation.checkOutDate);
      return {
        reservation,
        hotelName: hotel?.name ?? 'Removed hotel',
        roomName: room?.name ?? 'Removed room',
        nights,
        totalPrice: (room?.pricePerNight ?? 0) * nights,
      };
    })
    .sort((a, b) => b.reservation.createdAt.localeCompare(a.reservation.createdAt));
  return { ok: true, reservations: views };
}

export type UpdateReservationStatusResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; error: string };

/** Changes a reservation's status (staff only). Validates the target status. */
export function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): UpdateReservationStatusResult {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  if (!RESERVATION_STATUSES.includes(status)) {
    return { ok: false, error: 'That is not a valid reservation status.' };
  }

  const { reservations, updateReservationStatus: apply } = useDataStore.getState();
  const existing = reservations.find((candidate) => candidate.id === id);
  if (!existing) return { ok: false, error: 'No reservation was found with that ID.' };
  if (existing.status === status) {
    return { ok: false, error: `This reservation is already marked ${status}.` };
  }

  apply(id, status);
  const updated = useDataStore.getState().reservations.find((candidate) => candidate.id === id);
  if (!updated) return { ok: false, error: 'Could not update the reservation.' };
  return { ok: true, reservation: updated };
}
