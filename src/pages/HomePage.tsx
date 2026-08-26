import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Leaf, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const features = [
  {
    icon: ShieldCheck,
    title: 'Reserve without paying',
    text: 'Book with your name and email. Payment happens at the hotel, on arrival — nothing is charged online.',
  },
  {
    icon: CalendarClock,
    title: 'Free cancellation',
    text: 'Plans change. Cancel at no charge up to 48 hours before check-in, right from your booking page.',
  },
  {
    icon: Leaf,
    title: 'Forest-side stays',
    text: 'Every property on Evergreen is hand-picked for scenery, quiet, and comfort — from city lodges to remote cabins.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const today = todayISO();

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError('');
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', guests);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-forest-100 via-background to-background dark:from-forest-950 dark:via-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-forest-300/30 blur-3xl dark:bg-forest-500/10"
        />

        <div className="container px-4 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Reserve now, pay at the hotel
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Find your quiet corner{' '}
            <span className="text-forest-700 dark:text-forest-400">of the world</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Search forest-side hotels and cabins, see real availability, and reserve in under a minute — no card
            required.
          </motion.p>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
            className="mx-auto mt-10 max-w-4xl"
          >
            <Card className="border-forest-700/10 shadow-soft-lg">
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] lg:items-end">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="hero-city">City or area</Label>
                    <Input
                      id="hero-city"
                      placeholder="e.g. Bend, Oregon"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="hero-checkin">Check-in</Label>
                    <Input
                      id="hero-checkin"
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="hero-checkout">Check-out</Label>
                    <Input
                      id="hero-checkout"
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="hero-guests">Guests</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger id="hero-guests" aria-label="Number of guests">
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
                  <Button type="submit" size="lg" className="w-full gap-2 lg:w-auto">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </form>
                {error && <p className="mt-3 text-left text-sm font-medium text-destructive">{error}</p>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Free cancellation up to 48 h before arrival · Instant confirmation · No payment online
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Why Evergreen Stays</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            We keep booking simple and honest, so you can spend less time in forms and more time outside.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6 transition-shadow hover:shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-900 dark:text-forest-300">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-forest-800 bg-gradient-to-br from-forest-700 to-forest-900 px-6 py-14 text-center shadow-soft-lg sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-forest-400/20 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-forest-950/40 blur-2xl"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your next escape is a search away
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-forest-100">
            Browse hand-picked stays, compare rooms, and reserve in minutes. Arrival payment only.
          </p>
          <Button asChild size="lg" className="relative mt-8 gap-2 bg-white text-forest-800 hover:bg-forest-50">
            <Link to="/search">
              Start searching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
