import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Mail,
  MapPin,
  SearchX,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { getReservation } from '../services/reservations';
import { useDataStore } from '../store/data';
import { nightsBetween } from '../lib/dates';
import { formatDate, formatGuests, formatNights, formatPrice } from '../lib/format';

export default function BookingConfirmationPage() {
  const { reservationId = '' } = useParams<{ reservationId: string }>();
  const result = getReservation(reservationId);

  if (!result.ok) {
    return (
      <div className="container flex flex-col items-center px-4 py-24 text-center sm:py-28">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
          <SearchX className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">Reservation not found</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          We couldn't find a reservation with that ID. It may have been removed, or the link may be incomplete. If you
          have the reservation ID, try the My Booking page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/lookup">Go to My Booking</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/search">
              Book another stay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { reservation } = result;
  const { hotels, rooms } = useDataStore.getState();
  const hotel = hotels.find((candidate) => candidate.id === reservation.hotelId);
  const room = rooms.find((candidate) => candidate.id === reservation.roomId);
  const nights = nightsBetween(reservation.checkInDate, reservation.checkOutDate);
  const total = (room?.pricePerNight ?? 0) * nights;

  return (
    <div className="container flex flex-col items-center px-4 py-14 sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-soft-lg">
        <BadgeCheck className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        You're all set, {reservation.guestName.split(' ')[0] || 'guest'}
      </h1>
      <p className="mt-3 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
        Your reservation is confirmed. We've sent the details to {reservation.guestEmail} — show this page or your
        email at the front desk on arrival.
      </p>

      <Badge variant="secondary" className="mt-6 gap-1.5 px-3 py-1 text-sm">
        <Ticket className="h-4 w-4" />
        Reservation {reservation.id}
      </Badge>

      <Card className="mt-8 w-full max-w-2xl border-forest-700/10 shadow-soft">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Badge variant="secondary" className="gap-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Confirmed — no payment taken
            </Badge>
          </CardTitle>
          <CardDescription>Pay at the hotel on arrival. Free cancellation up to 48 h before check-in.</CardDescription>
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
            <p className="mt-1 font-medium text-foreground">{room?.name ?? 'Room'}</p>
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
              <Mail className="h-4 w-4 text-forest-700 dark:text-forest-400" />
              {reservation.guestEmail}
            </p>
          </div>

          {reservation.guestPhone && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
              <p className="mt-1 font-medium text-foreground">{reservation.guestPhone}</p>
            </div>
          )}

          <div className="sm:col-span-2 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
            Pay {total > 0 ? formatPrice(total) : 'the balance'} at the hotel on arrival. Free cancellation up to 48
            hours before check-in — no payment is taken online.
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/lookup">Go to My Booking</Link>
        </Button>
        <Button asChild className="gap-2">
          <Link to="/search">
            Book another stay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
