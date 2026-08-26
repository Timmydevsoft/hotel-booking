export type UserRole = 'GUEST' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
  starRating: number;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

export interface Reservation {
  id: string;
  hotelId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  /** ISO date string (yyyy-mm-dd) */
  checkInDate: string;
  /** ISO date string (yyyy-mm-dd) */
  checkOutDate: string;
  guests: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface SearchQuery {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/** Everything a guest submits when booking a room. */
export interface BookingInput {
  hotelId: string;
  roomId: string;
  /** ISO date string (yyyy-mm-dd) */
  checkIn: string;
  /** ISO date string (yyyy-mm-dd) */
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

export type ReservationResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; error: string };
