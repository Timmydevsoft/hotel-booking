import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  className?: string;
  /** Accessible label override, e.g. "4 out of 5 stars". */
  label?: string;
}

/** Row of filled/outline stars for a hotel's star rating. */
export default function StarRating({ rating, className, label }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={label ?? `${clamped} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            'h-4 w-4',
            i < clamped ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
          )}
        />
      ))}
    </span>
  );
}
