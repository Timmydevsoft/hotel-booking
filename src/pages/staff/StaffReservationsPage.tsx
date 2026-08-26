import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Mail,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { getAllReservations, updateReservationStatus, type StaffReservationView } from '../../services/reservations';
import { useDataStore } from '../../store/data';
import type { ReservationStatus } from '../../types';
import { formatDate, formatGuests, formatNights, formatPrice } from '../../lib/format';
import { cn } from '../../lib/utils';

const STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'];

const STATUS_META: Record<ReservationStatus, { label: string; badge: string }> = {
  PENDING: {
    label: 'Pending',
    badge: 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badge: 'border-forest-300 bg-forest-100 text-forest-900 dark:border-forest-800 dark:bg-forest-950 dark:text-forest-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'border-red-300 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
  },
  CHECKED_IN: {
    label: 'Checked in',
    badge: 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200',
  },
  CHECKED_OUT: {
    label: 'Checked out',
    badge: 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300',
  },
};

type Notice = { tone: 'success' | 'error'; message: string } | null;

interface StatCardProps {
  icon: typeof ClipboardList;
  label: string;
  value: number;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="border-forest-700/10">
      <CardContent className="flex items-center gap-3 p-4 sm:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700 ring-1 ring-forest-700/10 dark:bg-forest-900 dark:text-forest-300 dark:ring-forest-300/10">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusSelect({
  view,
  onChange,
}: {
  view: StaffReservationView;
  onChange: (view: StaffReservationView, status: ReservationStatus) => void;
}) {
  return (
    <Select
      value={view.reservation.status}
      onValueChange={(value) => onChange(view, value as ReservationStatus)}
    >
      <SelectTrigger className="h-8 w-36 text-xs" aria-label={`Status for reservation ${view.reservation.id}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_META[status].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function StaffReservationsPage() {
  // Subscribe to the data slices so the table refreshes after status changes.
  const reservations = useDataStore((s) => s.reservations);
  const hotels = useDataStore((s) => s.hotels);
  const rooms = useDataStore((s) => s.rooms);

  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const result = useMemo(() => getAllReservations(), [reservations, hotels, rooms]);

  if (!result.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <p className="text-base font-medium text-foreground">Reservations unavailable</p>
        <p className="max-w-md text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const views = result.reservations;
  const counts: Record<ReservationStatus | 'ALL', number> = {
    ALL: views.length,
    PENDING: views.filter((v) => v.reservation.status === 'PENDING').length,
    CONFIRMED: views.filter((v) => v.reservation.status === 'CONFIRMED').length,
    CANCELLED: views.filter((v) => v.reservation.status === 'CANCELLED').length,
    CHECKED_IN: views.filter((v) => v.reservation.status === 'CHECKED_IN').length,
    CHECKED_OUT: views.filter((v) => v.reservation.status === 'CHECKED_OUT').length,
  };
  const filtered = filter === 'ALL' ? views : views.filter((v) => v.reservation.status === filter);

  function handleStatusChange(view: StaffReservationView, status: ReservationStatus) {
    const update = updateReservationStatus(view.reservation.id, status);
    if (!update.ok) {
      setNotice({ tone: 'error', message: update.error });
      return;
    }
    setNotice({
      tone: 'success',
      message: `${view.reservation.id} is now marked ${STATUS_META[status].label}.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Reservations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review every stay across the Evergreen portfolio and move each reservation through its lifecycle.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Clock className="h-3 w-3" />
          Updates apply instantly
        </Badge>
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium',
            notice.tone === 'success'
              ? 'border-forest-300 bg-forest-100 text-forest-900 dark:border-forest-800 dark:bg-forest-950 dark:text-forest-200'
              : 'border-red-300 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
          )}
        >
          {notice.tone === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total reservations" value={counts.ALL} />
        <StatCard icon={CheckCircle2} label="Confirmed" value={counts.CONFIRMED} />
        <StatCard icon={UserCheck} label="Checked in" value={counts.CHECKED_IN} />
        <StatCard icon={Clock} label="Pending" value={counts.PENDING} />
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as ReservationStatus | 'ALL')}>
        <TabsList className="h-auto flex-wrap">
          {(['ALL', ...STATUSES] as const).map((status) => (
            <TabsTrigger key={status} value={status} className="gap-1.5">
              {status === 'ALL' ? 'All' : STATUS_META[status].label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {counts[status]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ClipboardList className="h-7 w-7" />
            </span>
            <p className="text-base font-medium text-foreground">
              {views.length === 0
                ? 'No reservations yet'
                : `No ${filter === 'ALL' ? 'reservations match' : `${STATUS_META[filter].label.toLowerCase()} reservations`}`}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {views.length === 0
                ? 'Confirm a stay on the public booking flow and it lands here instantly, ready for the next step.'
                : 'Try another status filter to see other reservations.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-forest-700/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Stay</TableHead>
                <TableHead>Hotel &amp; room</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((view) => {
                const { reservation } = view;
                return (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <p className="font-mono text-xs font-semibold text-foreground">{reservation.id}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Created {formatDate(reservation.createdAt.slice(0, 10))}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{reservation.guestName}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        {reservation.guestEmail}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-forest-700 dark:text-forest-400" />
                        {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3 shrink-0" />
                        {formatNights(view.nights)} · {formatGuests(reservation.guests)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{view.hotelName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{view.roomName}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-sm font-semibold text-forest-700 dark:text-forest-400">
                        {formatPrice(view.totalPrice)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-2">
                        <Badge variant="outline" className={cn('border', STATUS_META[reservation.status].badge)}>
                          {STATUS_META[reservation.status].label}
                        </Badge>
                        <StatusSelect view={view} onChange={handleStatusChange} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
