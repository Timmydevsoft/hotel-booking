import { useDataStore } from '../store/data';
import type { Hotel, Room, SearchQuery } from '../types';
import { validateGuests, validateStayDates } from './validation';

/**
 * Guest-facing hotel queries: search, hotel details, and availability.
 * All functions read the latest persisted state from the data store and
 * validate their inputs before answering.
 */

/** One matching hotel in a search result. */
export interface HotelSearchHit {
  hotel: Hotel;
  /** Rooms that fit the requested dates and party size (all rooms when no dates are given). */
  matchingRooms: Room[];
  /** Cheapest nightly rate among the matching rooms. */
  priceFrom: number;
  /** Total rooms in the hotel's inventory. */
  totalRooms: number;
  /** Number of rooms that matched the search. */
  availableCount: number;
}

export type SearchHotelsResult =
  | { ok: true; hits: HotelSearchHit[]; query: SearchQuery }
  | { ok: false; error: string };

/**
 * Finds hotels with at least one room for the requested stay.
 * With no dates supplied the search is open-ended (city/party size only),
 * so every hotel with a fitting room is returned.
 */
export function searchHotels(query: SearchQuery): SearchHotelsResult {
  const dateError = validateStayDates(query.checkIn, query.checkOut);
  if (dateError) return { ok: false, error: dateError };
  const guestsError = validateGuests(query.guests);
  if (guestsError) return { ok: false, error: guestsError };

  const { hotels, rooms, isRoomAvailable } = useDataStore.getState();
  const city = query.city?.trim().toLowerCase();
  const checkIn = query.checkIn ?? '';
  const checkOut = query.checkOut ?? '';
  const guests = query.guests;

  const hits: HotelSearchHit[] = [];
  for (const hotel of hotels) {
    if (city && !hotel.city.toLowerCase().includes(city)) continue;

    const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id);
    const matchingRooms = hotelRooms.filter((room) => {
      if (guests !== undefined && room.capacity < guests) return false;
      if (checkIn && checkOut) return isRoomAvailable(room.id, checkIn, checkOut);
      return true;
    });
    if (matchingRooms.length === 0) continue;

    hits.push({
      hotel,
      matchingRooms,
      priceFrom: Math.min(...matchingRooms.map((room) => room.pricePerNight)),
      totalRooms: hotelRooms.length,
      availableCount: matchingRooms.length,
    });
  }

  hits.sort((a, b) => a.priceFrom - b.priceFrom);
  return { ok: true, hits, query: { ...query, city: query.city?.trim() } };
}

export type HotelDetailResult =
  | { ok: true; hotel: Hotel; rooms: Room[] }
  | { ok: false; error: string };

/** Hotel details plus its full room inventory (availability is date-aware separately). */
export function getHotel(id: string): HotelDetailResult {
  const { hotels, rooms } = useDataStore.getState();
  const hotel = hotels.find((candidate) => candidate.id === id);
  if (!hotel) return { ok: false, error: 'That hotel could not be found.' };
  const hotelRooms = rooms
    .filter((room) => room.hotelId === id)
    .sort((a, b) => a.pricePerNight - b.pricePerNight);
  return { ok: true, hotel, rooms: hotelRooms };
}

export interface AvailableRoomsInput {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export type AvailableRoomsResult =
  | { ok: true; hotel: Hotel; rooms: Room[]; checkIn: string; checkOut: string; guests: number }
  | { ok: false; error: string };

/** Rooms at a hotel that are free for the whole stay and fit the party size. */
export function getAvailableRooms(hotelId: string, input: AvailableRoomsInput): AvailableRoomsResult {
  const dateError = validateStayDates(input.checkIn, input.checkOut);
  if (dateError) return { ok: false, error: dateError };
  const guestsError = validateGuests(input.guests);
  if (guestsError) return { ok: false, error: guestsError };

  const { hotels, rooms, isRoomAvailable } = useDataStore.getState();
  const hotel = hotels.find((candidate) => candidate.id === hotelId);
  if (!hotel) return { ok: false, error: 'That hotel could not be found.' };

  const availableRooms = rooms
    .filter(
      (room) =>
        room.hotelId === hotelId &&
        room.capacity >= input.guests &&
        isRoomAvailable(room.id, input.checkIn, input.checkOut),
    )
    .sort((a, b) => a.pricePerNight - b.pricePerNight);

  return {
    ok: true,
    hotel,
    rooms: availableRooms,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
  };
}
