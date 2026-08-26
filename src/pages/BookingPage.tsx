import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, CalendarDays, MapPin, ShieldCheck, Users, Wallet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import HotelArt from '../components/HotelArt';
import { getHotel } from '../services/hotels';
import { createReservation } from '../services/reservations';
import { nightsBetween } from '../lib/dates';
import { formatDate, formatDateRange, formatGuests, formatNights, formatPrice } from '../lib/format';

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hotelId = searchParams.get('hotelId') ?? '';
  const roomId = searchParams.get('roomId') ?? '';

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '2');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const detail = getHotel(hotelId);
  const room = detail.ok ? detail.rooms.find((candidate) => candidate.id === roomId) : undefined;

  if (!detail.ok || !room) {
    return (
      <div className="container flex flex-col items-center px-4 py-24 text-center sm:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nothing to book yet</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Pick a room from a hotel's page and we'll bring you back here with everything pre-filled. All we need is your
          name, email, and dates — no payment is taken online.
        </p>
        <Button asChild variant="outline" className="mt-8 gap-2">
          <Link to="/search">
            <ArrowLeft className="h-4 w-4" />
            Find a stay
          </Link>
        </Button>
      </div>
    );
  }

  const { hotel } = detail;
  const guestsNum = Number(guests) || 2;
  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * room.pricePerNight;
  const today = todayISO();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!checkIn || !checkOut) {
      setError('Please choose your check-in and check-out dates.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }

    setSubmitting(true);
    const result = createReservation({
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests: guestsNum,
      guestName,
      guestEmail,
      guestPhone: guestPhone || undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/booking/confirmation/${result.reservation.id}`);
  }

  return (
    <div className="container px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground">
          <Link to={`/hotels/${hotel.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to {hotel.name}
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Complete your reservation</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Confirm your dates and tell us who's staying. Your room is only secured once you submit — and nothing is
            charged today.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card className="border-forest-700/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-forest-700 dark:text-forest-400" />
                  Your stay
                </CardTitle>
                <CardDescription>Dates are already filled in from your search — adjust if plans changed.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-checkin">Check-in</Label>
                  <Input
                    id="booking-checkin"
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-checkout">Check-out</Label>
                  <Input
                    id="booking-checkout"
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-guests">Guests</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger id="booking-guests" aria-label="Number of guests">
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
              </CardContent>
            </Card>

            <Card className="border-forest-700/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-forest-700 dark:text-forest-400" />
                  Guest details
                </CardTitle>
                <CardDescription>
                  We'll send your confirmation to this email. You can pay at the hotel — no card details are needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">Full name</Label>
                  <Input
                    id="booking-name"
                    placeholder="e.g. Jordan Lee"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-email">Email</Label>
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="booking-phone">Phone (optional)</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    placeholder="+1 555 000 1234"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            <Button type="submit" size="lg" className="gap-2 sm:w-fit" disabled={submitting}>
              <ShieldCheck className="h-5 w-5" />
              {submitting ? 'Securing your stay…' : 'Confirm reservation'}
            </Button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
              Free cancellation up to 48 h before arrival. No payment is taken online.
            </p>
          </form>

          {/* Summary */}
          <Card className="border-forest-700/10 shadow-soft lg:sticky lg:top-24">
            <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
              <HotelArt art={hotel.images[0] ?? 'pine'} alt={`${hotel.name} exterior`} size="sm" className="h-36 w-full" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{hotel.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
                  {hotel.city}, {hotel.country}
                </p>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-border pt-4">
                <div>
                  <p className="font-medium text-foreground">{room.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{room.type}</p>
                </div>
                <BedDouble className="h-5 w-5 shrink-0 text-forest-700 dark:text-forest-400" />
              </div>

              <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Dates
                  </dt>
                  <dd className="text-right font-medium text-foreground">
                    {checkIn && checkOut ? formatDateRange(checkIn, checkOut) : 'Not set'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Guests
                  </dt>
                  <dd className="font-medium text-foreground">{formatGuests(guestsNum)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {formatPrice(room.pricePerNight)} × {nights > 0 ? formatNights(nights) : 'nights'}
                  </dt>
                  <dd className="font-medium text-foreground">{nights > 0 ? formatPrice(total) : '—'}</dd>
                </div>
              </dl>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-semibold text-foreground">Total for stay</span>
                <span className="text-2xl font-semibold text-forest-700 dark:text-forest-400">
                  {nights > 0 ? formatPrice(total) : '—'}
                </span>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Pay {formatPrice(total)} at the hotel on arrival — nothing is charged to your card today.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
