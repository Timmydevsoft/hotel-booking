import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, MapPin, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import HotelArt from '../components/HotelArt';
import StarRating from '../components/StarRating';
import { getAvailableRooms, getHotel } from '../services/hotels';
import { useDataStore } from '../store/data';
import type { Room } from '../types';
import { formatGuests, formatPrice } from '../lib/format';
import { cn } from '../lib/utils';

function buildBookingLink(hotelId: string, roomId: string, checkIn: string, checkOut: string, guests: string): string {
  const query = new URLSearchParams({ hotelId, roomId });
  if (checkIn) query.set('checkIn', checkIn);
  if (checkOut) query.set('checkOut', checkOut);
  query.set('guests', guests || '2');
  return `/booking?${query.toString()}`;
}

interface RoomRowProps {
  hotelId: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: string;
  availableIds: Set<string> | null;
  datesInvalid: boolean;
}

function RoomRow({ hotelId, room, checkIn, checkOut, guests, availableIds, datesInvalid }: RoomRowProps) {
  const datesSet = Boolean(checkIn && checkOut);
  const isAvailable = availableIds?.has(room.id) ?? false;
  const canBook = !datesInvalid && (!datesSet || isAvailable);

  return (
    <Card className="border-forest-700/10 transition-shadow hover:shadow-soft">
      <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr] sm:p-6">
        <HotelArt art={room.images[0] ?? 'pine'} alt={`${room.name} room`} size="sm" className="h-28 sm:h-full sm:min-h-32" />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{room.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{room.type}</p>
            </div>
            <p className="text-right">
              <span className="text-xl font-semibold text-forest-700 dark:text-forest-400">
                {formatPrice(room.pricePerNight)}
              </span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </p>
          </div>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
            Sleeps {room.capacity}
            <span aria-hidden className="mx-1 text-border">•</span>
            <BedDouble className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
            {room.type}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {amenity}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {datesSet && !datesInvalid ? (
              isAvailable ? (
                <Badge variant="secondary" className="gap-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200">
                  <Check className="h-3 w-3" />
                  Available for your dates
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                  Unavailable for these dates
                </Badge>
              )
            ) : datesInvalid ? (
              <span className="text-sm text-muted-foreground">Check your dates above</span>
            ) : (
              <span className="text-sm text-muted-foreground">Select dates to check availability</span>
            )}
            {canBook ? (
              <Button asChild className="gap-2">
                <Link to={buildBookingLink(hotelId, room.id, checkIn, checkOut, guests)}>
                  Book
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button disabled className="gap-2">
                Book
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function HotelDetailsPage() {
  const { hotelId = '' } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '2');

  // Subscribe to the data store so the page reflects live inventory and
  // bookings: a staff edit or a newly confirmed stay shows up immediately.
  const hotels = useDataStore((s) => s.hotels);
  const roomInventory = useDataStore((s) => s.rooms);
  const reservations = useDataStore((s) => s.reservations);

  const detail = useMemo(() => getHotel(hotelId), [hotelId, hotels, roomInventory]);
  const datesSet = Boolean(checkIn && checkOut);
  const availability = useMemo(
    () =>
      datesSet
        ? getAvailableRooms(hotelId, { checkIn, checkOut, guests: Number(guests) })
        : null,
    [hotelId, checkIn, checkOut, guests, datesSet, hotels, roomInventory, reservations],
  );
  const datesInvalid = availability !== null && !availability.ok;

  if (!detail.ok) {
    return (
      <div className="container flex flex-col items-center px-4 py-24 text-center sm:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Hotel not found</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          That property isn't in the Evergreen catalogue. It may have been removed by our team — try another search.
        </p>
        <Button asChild variant="outline" className="mt-8 gap-2">
          <Link to="/search">
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </Button>
      </div>
    );
  }

  const { hotel, rooms } = detail;
  const availableIds = availability?.ok ? new Set(availability.rooms.map((room) => room.id)) : null;
  const allUnavailable = availability?.ok && availability.rooms.length === 0;

  return (
    <div className="container px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground">
          <Link to="/search">
            <ArrowLeft className="h-4 w-4" />
            Back to search results
          </Link>
        </Button>

        {/* Gallery */}
        <div className={cn('grid gap-4', hotel.images.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1')}>
          {hotel.images.length > 0 ? (
            hotel.images.map((art, index) => (
              <HotelArt
                key={`${art}-${index}`}
                art={art}
                alt={`${hotel.name} view ${index + 1}`}
                size="hero"
                className="min-h-60"
              />
            ))
          ) : (
            <HotelArt art="pine" alt={`${hotel.name} exterior`} size="hero" className="min-h-60" />
          )}
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{hotel.name}</h1>
            <StarRating rating={hotel.starRating} label={`${hotel.starRating} star hotel`} />
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-forest-700 dark:text-forest-400" />
              {hotel.city}, {hotel.country}
            </span>
            <span className="text-border">•</span>
            <span>{hotel.address}</span>
          </p>
        </div>

        {/* Description + amenities */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">About this property</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{hotel.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Amenities</h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {hotel.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Availability bar */}
        <Card className="border-forest-700/10">
          <CardContent className="p-4 sm:p-6">
            <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="details-checkin">Check-in</Label>
                <Input
                  id="details-checkin"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="details-checkout">Check-out</Label>
                <Input
                  id="details-checkout"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="details-guests">Guests</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger id="details-guests" aria-label="Number of guests">
                    <SelectValue placeholder="Guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1 lg:pb-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
                Availability updates instantly
              </div>
            </div>
            {datesInvalid && (
              <p className="mt-3 text-sm font-medium text-destructive">{availability?.error}</p>
            )}
            {allUnavailable && (
              <p className="mt-3 text-sm font-medium text-destructive">
                None of the rooms at {hotel.name} are free for those dates. Try different dates or another stay.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rooms */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Rooms &amp; suites</h2>
            <p className="text-sm text-muted-foreground">{rooms.length} room types</p>
          </div>

          {rooms.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-base font-medium text-foreground">No rooms listed yet</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  This property hasn't published its rooms. Check back soon or explore other stays.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link to="/search">Browse other stays</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              {rooms.map((room) => (
                <RoomRow
                  key={room.id}
                  hotelId={hotel.id}
                  room={room}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                  availableIds={availableIds}
                  datesInvalid={datesInvalid}
                />
              ))}
            </div>
          )}
        </div>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
          Prices are per night for {formatGuests(Number(guests) || 1)}. No payment is taken online — settle at the hotel.
        </p>
      </div>
    </div>
  );
}
