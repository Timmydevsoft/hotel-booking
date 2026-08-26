import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Mail,
  MapPin,
  SearchX,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import StatusBadge from '../components/staff/StatusBadge';
import { getReservation } from '../services/reservations';
import { useDataStore } from '../store/data';
import { nightsBetween } from '../lib/dates';
import { formatDate, formatGuests, formatNights, formatPrice } from '../lib/format';

export default function BookingLookupPage() {
  // A deep link like /lookup?id=rv-1002 shows the booking immediately.
  const [searchParams] = useSearchParams();
  const prefilled = searchParams.get('id') ?? '';

  const [code, setCode] = useState(prefilled);
  const [searchedCode, setSearchedCode] = useState(prefilled || null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSearchedCode(code.trim());
  }

  const lookup = searchedCode ? getReservation(searchedCode) : null;

  return (
    <div className="container flex flex-col items-center px-4 py-14 sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
        <Ticket className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">My Booking</h1>
      <p className="mt-3 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
        Enter your reservation ID to view your stay — dates, room, and current status. No sign-in required.
      </p>

      <Card className="mt-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Look up a reservation</CardTitle>
          <CardDescription>
            You will find your reservation ID in the confirmation you received after booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reservation-code">Reservation ID</Label>
              <Input
                id="reservation-code"
                placeholder="e.g. rv-1a2b3c4d"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              View booking
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite" className="mt-8 w-full max-w-2xl">
        {lookup?.ok && <ReservationCard reservationId={lookup.reservation.id} />}

        {lookup && !lookup.ok && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
              <SearchX className="h-8 w-8" />
            </span>
            <h2 className="mt-6 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              We couldn't find that reservation
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              No reservation matches the ID “{searchedCode}”. Double-check the code in your confirmation email, or
              book a new stay.
            </p>
            <Button asChild variant="outline" className="mt-8 gap-2">
              <Link to="/search">
                Search stays
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders one reservation's details, enriched with hotel/room names. */
function ReservationCard({ reservationId }: { reservationId: string }) {
  const lookup = getReservation(reservationId);
  if (!lookup.ok) return null;
  const reservation = lookup.reservation;
  const { hotels, rooms } = useDataStore.getState();
  const hotel = hotels.find((candidate) => candidate.id === reservation.hotelId);
  const room = rooms.find((candidate) => candidate.id === reservation.roomId);
  const nights = nightsBetween(reservation.checkInDate, reservation.checkOutDate);
  const total = (room?.pricePerNight ?? 0) * nights;
  const isCancelled = reservation.status === 'CANCELLED';

  return (
    <Card className="border-forest-700/10 shadow-soft">
      <CardHeader className="border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={reservation.status} />
          </div>
          <p className="font-mono text-xs font-semibold text-muted-foreground">ID {reservation.id}</p>
        </div>
        <CardDescription className="pt-1">
          Booked for {reservation.guestName} · {formatDate(reservation.createdAt.slice(0, 10))}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{hotel?.name ?? 'Evergreen stay'}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
            {hotel ? `${hotel.city}, ${hotel.country}` : 'Details on arrival'}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <BedDouble className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
            {room?.name ?? 'Room'}
          </p>
          {room && <p className="mt-0.5 text-sm text-muted-foreground">{room.type}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total for stay</p>
          <p className="mt-1 text-xl font-semibold text-forest-700 dark:text-forest-400">
            {total > 0 ? formatPrice(total) : 'Pay at hotel'}
          </p>
          {nights > 0 && room && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPrice(room.pricePerNight)} × {formatNights(nights)}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-in</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-forest-700 dark:text-forest-400" />
            {formatDate(reservation.checkInDate)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-out</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-forest-700 dark:text-forest-400" />
            {formatDate(reservation.checkOutDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guests</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <Users className="h-4 w-4 text-forest-700 dark:text-forest-400" />
            {formatGuests(reservation.guests)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
            <Mail className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
            {reservation.guestEmail}
          </p>
        </div>

        <div
          className={`sm:col-span-2 flex items-start gap-2 rounded-xl p-4 text-sm leading-relaxed ${
            isCancelled
              ? 'bg-muted text-muted-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {isCancelled ? (
            <span>
              This reservation was cancelled and no longer holds the room. If you changed your mind, you can book a
              new stay for your dates.
            </span>
          ) : (
            <span>
              Pay {total > 0 ? formatPrice(total) : 'the balance'} at the hotel on arrival — nothing was charged
              online when you reserved.
            </span>
          )}
        </div>
      </CardContent>

      <div className="flex flex-wrap gap-3 border-t border-border p-6">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/search">
            Book another stay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {hotel && room && (
          <Button asChild variant="ghost">
            <Link to={`/hotels/${hotel.id}`}>View {hotel.name}</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
