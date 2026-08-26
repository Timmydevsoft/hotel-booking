import { Building2, Flower2, Home, Mountain, Trees, Waves, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Gradient + icon artwork used in place of photography. Each seed image
 * key maps to a distinct palette and scene so galleries read as varied
 * without any external image URLs.
 */

interface ArtStyle {
  icon: LucideIcon;
  gradient: string;
  iconClass: string;
}

const ART_STYLES: Record<string, ArtStyle> = {
  pine: {
    icon: Trees,
    gradient: 'from-forest-600 via-forest-700 to-forest-950',
    iconClass: 'text-forest-200',
  },
  canopy: {
    icon: Trees,
    gradient: 'from-forest-400 via-forest-600 to-forest-900',
    iconClass: 'text-forest-100',
  },
  cabin: {
    icon: Home,
    gradient: 'from-amber-600 via-amber-800 to-forest-950',
    iconClass: 'text-amber-100',
  },
  meadow: {
    icon: Flower2,
    gradient: 'from-lime-300 via-forest-500 to-forest-800',
    iconClass: 'text-forest-50',
  },
  stone: {
    icon: Building2,
    gradient: 'from-stone-400 via-stone-600 to-stone-900',
    iconClass: 'text-stone-100',
  },
  lake: {
    icon: Waves,
    gradient: 'from-teal-400 via-forest-700 to-forest-950',
    iconClass: 'text-teal-50',
  },
};

const FALLBACK: ArtStyle = {
  icon: Mountain,
  gradient: 'from-forest-500 via-forest-700 to-forest-950',
  iconClass: 'text-forest-100',
};

interface HotelArtProps {
  /** Seed image key, e.g. 'pine' or 'lake'. */
  art: string;
  alt?: string;
  className?: string;
  /** Visual scale: card thumbnails vs page hero panels. */
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

const SIZE_CLASSES: Record<NonNullable<HotelArtProps['size']>, string> = {
  sm: 'h-24 rounded-lg',
  md: 'h-40 rounded-xl',
  lg: 'h-56 rounded-xl',
  hero: 'h-full min-h-56 w-full rounded-xl',
};

const ICON_SIZE: Record<NonNullable<HotelArtProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  hero: 'h-16 w-16',
};

export default function HotelArt({ art, alt, className, size = 'md' }: HotelArtProps) {
  const style = ART_STYLES[art] ?? FALLBACK;
  const Icon = style.icon;
  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt}
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-br shadow-inner',
        style.gradient,
        SIZE_CLASSES[size],
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/20 blur-2xl"
      />
      <Icon className={cn('relative drop-shadow-md', style.iconClass, ICON_SIZE[size])} />
    </div>
  );
}
