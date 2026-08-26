import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, SearchX, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import HotelArt from '../components/HotelArt';
import StarRating from '../components/StarRating';
import { searchHotels, type HotelSearchHit } from '../services/hotels';
import { formatDate, formatGuests, formatPrice } from '../lib/format';
import { cn } from '../lib/utils';

function buildDetailsLink(hit: HotelSearchHit, params: URLSearchParams): string {
  const query = new URLSearchParams();
  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  const guests = params.get('guests');
  if (checkIn) query.set('checkIn', checkIn);
  if (checkOut) query.set('checkOut', checkOut);
  if (guests) query.set('guests', guests);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return `/hotels/${hit.hotel.id}${suffix}`;
}

function HotelCard({ hit, params }: { hit: HotelSearchHit; params: URLSearchParams }) {
  const { hotel } = hit;
  const detailLink = buildDetailsLink(hit, params);

  return (
    <Card className="group overflow-hidden border-forest-700/10 transition-shadow hover:shadow-soft-lg">
      <div className="grid md:grid-cols-[300px_1fr]">
        <Link
          to={detailLink}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${hotel.name}`}
        >
          <HotelArt
            art={hotel.images[0] ?? 'pine'}
            alt={`${hotel.name} exterior`}
            size="md"
            className="h-48 rounded-none md:h-full"
          />
        </Link>

        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{hotel.name}</h2>
              <StarRating rating={hotel.starRating} label={`${hotel.starRating} star hotel`} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
              {hotel.city}, {hotel.country}
            </p>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="text-lg font-semibold text-forest-700 dark:text-forest-400">
                  {formatPrice(hit.priceFrom)}
                </span>
                <span className="text-muted-foreground">/ night</span>
              </p>
              <p className="text-muted-foreground">
                {hit.availableCount} of {hit.totalRooms} rooms available for your stay
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link to={detailLink}>
                View stays
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const city = params.get('city') ?? '';
  const checkIn = params.get('checkIn') ?? '';
  const checkOut = params.get('checkOut') ?? '';
  const guestsRaw = params.get('guests') ?? '';
  const guests = guestsRaw ? Number(guestsRaw) : undefined;

  const hasQuery = Boolean(city || checkIn || checkOut || guestsRaw);

  const result = searchHotels({
    city: city || undefined,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    guests,
  });

  return (
    <div className="container px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {hasQuery ? 'Search results' : 'All stays'}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {hasQuery
              ? 'Available stays for your trip, with real-time room availability and no payment required to reserve.'
              : 'Browse the full Evergreen catalogue. Every property is verified and every room shows live availability.'}
          </p>
        </div>

        {/* Query summary */}
        {hasQuery && (
          <Card className="border-forest-700/10">
            <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
              {city && (
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-forest-700 dark:text-forest-400" />
                  {city}
                </span>
              )}
              {checkIn && checkOut && (
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="h-4 w-4 text-forest-700 dark:text-forest-400" />
                  {formatDate(checkIn)} → {formatDate(checkOut)}
                </span>
              )}
              {guestsRaw && (
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <Users className="h-4 w-4 text-forest-700 dark:text-forest-400" />
                  {formatGuests(guests ?? 0)}
                </span>
              )}
            </CardContent>
          </Card>
        )}

        {!result.ok && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-destructive">{result.error}</p>
            </CardContent>
          </Card>
        )}

        {result.ok && result.hits.length === 0 && (
          <div className={cn('flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center')}>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
              <SearchX className="h-8 w-8" />
            </span>
            <h2 className="mt-6 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              No stays match that search
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              We couldn't find a room for your dates in this area. Try widening your dates, exploring another region,
              or check back as new properties join Evergreen.
            </p>
            <Button asChild variant="outline" className="mt-8 gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Refine search
              </Link>
            </Button>
          </div>
        )}

        {result.ok && result.hits.length > 0 && (
          <>
            <p className="text-sm font-medium text-muted-foreground">
              {result.hits.length} {result.hits.length === 1 ? 'stay' : 'stays'} available
              {city && (
                <>
                  {' '}
                  in <span className="text-foreground">{city}</span>
                </>
              )}
            </p>
            <div className="flex flex-col gap-6">
              {result.hits.map((hit) => (
                <HotelCard key={hit.hotel.id} hit={hit} params={params} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
