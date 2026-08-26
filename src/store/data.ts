import { create } from 'zustand';
import type {
  BookingInput,
  Hotel,
  Reservation,
  ReservationResult,
  ReservationStatus,
  Room,
} from '../types';
import {
  buildSeedHotels,
  buildSeedReservations,
  buildSeedRooms,
  SEED_VERSION,
} from '../data/seed';
import { isDateRangeOverlapping, isValidStay } from '../lib/dates';

const DATA_KEY = 'evergreen-data';

interface PersistedData {
  version: number;
  hotels: Hotel[];
  rooms: Room[];
  reservations: Reservation[];
}

/** Short, readable id for a new record. */
function makeId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

function buildSeedData(): PersistedData {
  return {
    version: SEED_VERSION,
    hotels: buildSeedHotels(),
    rooms: buildSeedRooms(),
    reservations: buildSeedReservations(),
  };
}

function loadInitialData(): PersistedData {
  if (typeof window === 'undefined') return buildSeedData();
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedData;
      if (
        parsed &&
        parsed.version === SEED_VERSION &&
        Array.isArray(parsed.hotels) &&
        Array.isArray(parsed.rooms) &&
        Array.isArray(parsed.reservations)
      ) {
        return parsed;
      }
    }
  } catch {
    // Corrupted or unreadable storage — fall through to a fresh seed.
  }
  return buildSeedData();
}

interface DataState extends PersistedData {
  // Admin / inventory mutations
  addHotel: (draft: Omit<Hotel, 'id'>) => Hotel;
  updateHotel: (id: string, patch: Partial<Omit<Hotel, 'id'>>) => void;
  removeHotel: (id: string) => void;
  addRoom: (draft: Omit<Room, 'id'>) => Room;
  updateRoom: (id: string, patch: Partial<Omit<Room, 'id'>>) => void;
  removeRoom: (id: string) => void;
  // Reservation mutations
  createReservation: (input: BookingInput) => ReservationResult;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  // Availability
  isRoomAvailable: (roomId: string, checkIn: string, checkOut: string) => boolean;
  getAvailableRoomIds: (hotelId: string, checkIn: string, checkOut: string, guests: number) => string[];
  // Housekeeping
  resetData: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  ...loadInitialData(),

  addHotel: (draft) => {
    const hotel: Hotel = { ...draft, id: makeId('hotel') };
    set((state) => ({ hotels: [...state.hotels, hotel] }));
    return hotel;
  },

  updateHotel: (id, patch) =>
    set((state) => ({
      hotels: state.hotels.map((hotel) => (hotel.id === id ? { ...hotel, ...patch } : hotel)),
    })),

  removeHotel: (id) =>
    set((state) => ({
      hotels: state.hotels.filter((hotel) => hotel.id !== id),
      rooms: state.rooms.filter((room) => room.hotelId !== id),
    })),

  addRoom: (draft) => {
    const room: Room = { ...draft, id: makeId('room') };
    set((state) => ({ rooms: [...state.rooms, room] }));
    return room;
  },

  updateRoom: (id, patch) =>
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    })),

  removeRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
      reservations: state.reservations.filter((reservation) => reservation.roomId !== id),
    })),

  createReservation: (input) => {
    const { hotels, rooms, reservations } = get();
    const { hotelId, roomId, checkIn, checkOut, guests, guestName, guestEmail } = input;

    const room = rooms.find((candidate) => candidate.id === roomId);
    if (!room || room.hotelId !== hotelId) {
      return { ok: false, error: 'That room is no longer available at this hotel.' };
    }
    if (!hotels.some((hotel) => hotel.id === hotelId)) {
      return { ok: false, error: 'That hotel could not be found.' };
    }
    if (!isValidStay(checkIn, checkOut)) {
      return { ok: false, error: 'Check-out must be after check-in.' };
    }
    if (!Number.isInteger(guests) || guests < 1) {
      return { ok: false, error: 'Please enter the number of guests.' };
    }
    if (guests > room.capacity) {
      return { ok: false, error: `This room sleeps up to ${room.capacity} guests.` };
    }
    if (!guestName.trim() || !guestEmail.trim()) {
      return { ok: false, error: 'Guest name and email are required.' };
    }
    if (!get().isRoomAvailable(roomId, checkIn, checkOut)) {
      return { ok: false, error: 'Sorry, this room is already booked for those dates.' };
    }

    const reservation: Reservation = {
      id: makeId('rv'),
      hotelId,
      roomId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: input.guestPhone?.trim() || undefined,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      reservations: [...state.reservations, reservation],
    }));
    return { ok: true, reservation };
  },

  updateReservationStatus: (id, status) =>
    set((state) => ({
      reservations: state.reservations.map((reservation) =>
        reservation.id === id ? { ...reservation, status } : reservation,
      ),
    })),

  isRoomAvailable: (roomId, checkIn, checkOut) => {
    if (!isValidStay(checkIn, checkOut)) return false;
    const { rooms, reservations } = get();
    if (!rooms.some((room) => room.id === roomId)) return false;
    return !reservations.some(
      (reservation) =>
        reservation.roomId === roomId &&
        reservation.status !== 'CANCELLED' &&
        isDateRangeOverlapping(checkIn, checkOut, reservation.checkInDate, reservation.checkOutDate),
    );
  },

  getAvailableRoomIds: (hotelId, checkIn, checkOut, guests) => {
    const { rooms } = get();
    return rooms
      .filter(
        (room) =>
          room.hotelId === hotelId &&
          room.capacity >= guests &&
          get().isRoomAvailable(room.id, checkIn, checkOut),
      )
      .map((room) => room.id);
  },

  resetData: () => set(() => buildSeedData()),
}));

// Persist the data slice to localStorage on every change.
useDataStore.subscribe((state) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      DATA_KEY,
      JSON.stringify({
        version: state.version,
        hotels: state.hotels,
        rooms: state.rooms,
        reservations: state.reservations,
      }),
    );
  } catch {
    // Storage full or unavailable — keep the in-memory state.
  }
});
