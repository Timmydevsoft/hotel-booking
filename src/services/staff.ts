import { useDataStore } from '../store/data';
import type { Hotel, Room } from '../types';
import { requireStaff } from './auth';
import { validateRequired } from './validation';

/**
 * Staff inventory service: create/edit/remove hotels and rooms.
 * Every operation starts with the staff role guard, so guest sessions
 * are rejected even if a page slips past the protected layout.
 */

export type HotelDraft = Omit<Hotel, 'id'>;
export type RoomDraft = Omit<Room, 'id'>;

export type StaffActionResult<T> = { ok: true; record: T } | { ok: false; error: string };
export type StaffSimpleResult = { ok: true } | { ok: false; error: string };

function validateHotelDraft(draft: HotelDraft): string | null {
  const nameError = validateRequired(draft.name, 'Hotel name');
  if (nameError) return nameError;
  const cityError = validateRequired(draft.city, 'City');
  if (cityError) return cityError;
  const countryError = validateRequired(draft.country, 'Country');
  if (countryError) return countryError;
  const addressError = validateRequired(draft.address, 'Address');
  if (addressError) return addressError;
  const descriptionError = validateRequired(draft.description, 'Description');
  if (descriptionError) return descriptionError;
  if (!Number.isInteger(draft.starRating) || draft.starRating < 1 || draft.starRating > 5) {
    return 'Star rating must be a whole number between 1 and 5.';
  }
  if (!Array.isArray(draft.amenities) || draft.amenities.some((amenity) => !amenity.trim())) {
    return 'Add at least one amenity, separated by commas.';
  }
  if (!Array.isArray(draft.images) || draft.images.length === 0) {
    return 'Pick an image for the property.';
  }
  return null;
}

function validateRoomDraft(draft: RoomDraft): string | null {
  const nameError = validateRequired(draft.name, 'Room name');
  if (nameError) return nameError;
  const typeError = validateRequired(draft.type, 'Room type');
  if (typeError) return typeError;
  if (!Number.isInteger(draft.capacity) || draft.capacity < 1) {
    return 'Capacity must be at least 1 guest.';
  }
  if (!Number.isFinite(draft.pricePerNight) || draft.pricePerNight <= 0) {
    return 'Price per night must be greater than zero.';
  }
  if (!Array.isArray(draft.amenities) || draft.amenities.some((amenity) => !amenity.trim())) {
    return 'Add at least one amenity, separated by commas.';
  }
  if (!Array.isArray(draft.images) || draft.images.length === 0) {
    return 'Pick an image for the room.';
  }
  return null;
}

/** Creates a hotel and returns it with its generated id. Staff only. */
export function createHotel(draft: HotelDraft): StaffActionResult<Hotel> {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const error = validateHotelDraft(draft);
  if (error) return { ok: false, error };

  const hotel = useDataStore.getState().addHotel({
    ...draft,
    amenities: draft.amenities.map((amenity) => amenity.trim()),
  });
  return { ok: true, record: hotel };
}

/** Replaces a hotel's editable fields. Staff only. */
export function updateHotel(id: string, patch: Partial<HotelDraft>): StaffActionResult<Hotel> {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { hotels, updateHotel: apply } = useDataStore.getState();
  const existing = hotels.find((hotel) => hotel.id === id);
  if (!existing) return { ok: false, error: 'That hotel could not be found.' };

  const merged: Hotel = {
    ...existing,
    ...patch,
    amenities: patch.amenities?.map((amenity) => amenity.trim()) ?? existing.amenities,
  };
  const error = validateHotelDraft(merged);
  if (error) return { ok: false, error };

  apply(id, merged);
  return { ok: true, record: merged };
}

/** Removes a hotel and its rooms. Historical reservations are kept. Staff only. */
export function deleteHotel(id: string): StaffSimpleResult {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { hotels } = useDataStore.getState();
  if (!hotels.some((hotel) => hotel.id === id)) {
    return { ok: false, error: 'That hotel could not be found.' };
  }
  useDataStore.getState().removeHotel(id);
  return { ok: true };
}

/** Creates a room for an existing hotel. Staff only. */
export function createRoom(draft: RoomDraft): StaffActionResult<Room> {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { hotels } = useDataStore.getState();
  if (!hotels.some((hotel) => hotel.id === draft.hotelId)) {
    return { ok: false, error: 'Pick a hotel to add this room to.' };
  }
  const error = validateRoomDraft(draft);
  if (error) return { ok: false, error };

  const room = useDataStore.getState().addRoom({
    ...draft,
    amenities: draft.amenities.map((amenity) => amenity.trim()),
  });
  return { ok: true, record: room };
}

/** Replaces a room's editable fields. Staff only. */
export function updateRoom(id: string, patch: Partial<RoomDraft>): StaffActionResult<Room> {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { rooms, updateRoom: apply } = useDataStore.getState();
  const existing = rooms.find((room) => room.id === id);
  if (!existing) return { ok: false, error: 'That room could not be found.' };

  const merged: Room = {
    ...existing,
    ...patch,
    amenities: patch.amenities?.map((amenity) => amenity.trim()) ?? existing.amenities,
  };
  const error = validateRoomDraft(merged);
  if (error) return { ok: false, error };

  apply(id, merged);
  return { ok: true, record: merged };
}

/** Removes a room and its reservations. Staff only. */
export function deleteRoom(id: string): StaffSimpleResult {
  const guard = requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { rooms } = useDataStore.getState();
  if (!rooms.some((room) => room.id === id)) {
    return { ok: false, error: 'That room could not be found.' };
  }
  useDataStore.getState().removeRoom(id);
  return { ok: true };
}
