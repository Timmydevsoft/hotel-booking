import {
  BadgeCheck,
  Ban,
  CheckCheck,
  Clock,
  DoorOpen,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { ReservationStatus } from '../../types';
import { cn } from '../../lib/utils';

/**
 * Human-readable labels, icons, and palette chips for every reservation
 * status. Shared by the reservations dashboard so badges, filter items,
 * and summary tiles always agree on colour and wording.
 */

export const STATUS_ORDER: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

export const STATUS_META: Record<
  ReservationStatus,
  { label: string; icon: LucideIcon; chipClass: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    chipClass: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: BadgeCheck,
    chipClass: 'bg-forest-100 text-forest-800 dark:bg-forest-400/15 dark:text-forest-300',
  },
  CHECKED_IN: {
    label: 'Checked in',
    icon: DoorOpen,
    chipClass: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  },
  CHECKED_OUT: {
    label: 'Checked out',
    icon: CheckCheck,
    chipClass: 'bg-stone-200 text-stone-800 dark:bg-stone-400/15 dark:text-stone-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: Ban,
    chipClass: 'bg-muted text-muted-foreground',
  },
};

export function statusLabel(status: ReservationStatus): string {
  return STATUS_META[status].label;
}

export default function StatusBadge({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 border-transparent', meta.chipClass, className)}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
