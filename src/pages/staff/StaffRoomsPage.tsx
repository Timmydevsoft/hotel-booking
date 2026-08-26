import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Building2, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import HotelArt from '../../components/HotelArt';
import { createRoom, deleteRoom, updateRoom, type RoomDraft } from '../../services/staff';
import { useDataStore } from '../../store/data';
import type { Room } from '../../types';
import { formatPrice } from '../../lib/format';
import { cn } from '../../lib/utils';

const ART_OPTIONS = ['pine', 'canopy', 'cabin', 'meadow', 'stone', 'lake'];
const CAPACITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

type Notice = { tone: 'success' | 'error'; message: string } | null;

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The hotel the new room belongs to (create mode). */
  hotelId: string;
  /** The room being edited, or null when adding a new one. */
  room: Room | null;
  /** Returns an error message to show in the dialog, or null on success. */
  onSubmit: (draft: RoomDraft) => string | null;
}

function RoomFormDialog({ open, onOpenChange, hotelId, room, onSubmit }: RoomFormDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [price, setPrice] = useState('150');
  const [amenities, setAmenities] = useState('');
  const [art, setArt] = useState('pine');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFormError('');
    if (room) {
      setName(room.name);
      setType(room.type);
      setCapacity(String(room.capacity));
      setPrice(String(room.pricePerNight));
      setAmenities(room.amenities.join(', '));
      setArt(room.images[0] ?? 'pine');
    } else {
      setName('');
      setType('');
      setCapacity('2');
      setPrice('150');
      setAmenities('');
      setArt('pine');
    }
  }, [open, room]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const pricePerNight = Math.round(Number(price));
    const draft: RoomDraft = {
      hotelId: room?.hotelId ?? hotelId,
      name: name.trim(),
      type: type.trim(),
      capacity: Number(capacity),
      pricePerNight,
      amenities: amenities
        .split(',')
        .map((amenity) => amenity.trim())
        .filter(Boolean),
      images: [art],
    };
    const error = onSubmit(draft);
    if (error) {
      setFormError(error);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? `Edit ${room.name}` : 'Add a room'}</DialogTitle>
          <DialogDescription>
            {room
              ? 'Update the room details — rates and capacity appear on the guest site immediately.'
              : 'Add a new room type to this property.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="room-name">Room name</Label>
              <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-type">Room type</Label>
              <Input
                id="room-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Queen, King, Suite…"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-capacity">Capacity</Label>
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger id="room-capacity" aria-label="Guest capacity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAPACITY_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Sleeps {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-price">Price per night (USD)</Label>
              <Input
                id="room-price"
                type="number"
                min={1}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-art">Room image</Label>
              <Select value={art} onValueChange={setArt}>
                <SelectTrigger id="room-art" aria-label="Room image">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ART_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <HotelArt art={art} alt="Room image preview" size="sm" className="h-28 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="room-amenities">Amenities</Label>
              <Input
                id="room-amenities"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="King bed, City view, Rain shower"
                required
              />
              <p className="text-xs text-muted-foreground">Separate each amenity with a comma.</p>
            </div>
          </div>
          {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {room ? 'Save changes' : 'Add room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffRoomsPage() {
  const hotels = useDataStore((s) => s.hotels);
  const rooms = useDataStore((s) => s.rooms);

  const [hotelId, setHotelId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const selectedHotel = hotels.find((hotel) => hotel.id === hotelId) ?? hotels[0] ?? null;

  const hotelRooms = useMemo(
    () =>
      selectedHotel
        ? rooms
            .filter((room) => room.hotelId === selectedHotel.id)
            .sort((a, b) => a.pricePerNight - b.pricePerNight)
        : [],
    [rooms, selectedHotel]
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function handleSaveRoom(draft: RoomDraft): string | null {
    if (editingRoom) {
      const result = updateRoom(editingRoom.id, draft);
      if (result.ok) {
        setNotice({ tone: 'success', message: `${result.record.name} was updated.` });
        return null;
      }
      return result.error;
    }
    const result = createRoom(draft);
    if (result.ok) {
      setNotice({ tone: 'success', message: `${result.record.name} was added to the room list.` });
      return null;
    }
    return result.error;
  }

  function handleDeleteRoom() {
    if (!deleteTarget) return;
    const result = deleteRoom(deleteTarget.id);
    setNotice(
      result.ok
        ? { tone: 'success', message: `${deleteTarget.name} was removed.` }
        : { tone: 'error', message: result.error }
    );
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Rooms</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and update rooms within each property — set the nightly rate, capacity, room type, and amenities so
            guests always see fresh availability.
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={!selectedHotel}
          onClick={() => {
            setEditingRoom(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add room
        </Button>
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
          {notice.message}
        </div>
      )}

      {hotels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Building2 className="h-7 w-7" />
            </span>
            <p className="text-base font-medium text-foreground">No hotels yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Rooms belong to a property, so add a hotel to the catalogue first.
            </p>
            <Button asChild variant="outline" className="mt-2 gap-2">
              <Link to="/staff/hotels">
                <Building2 className="h-4 w-4" />
                Go to Hotels
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-forest-700/10">
            <CardContent className="flex flex-wrap items-end gap-4 p-4 sm:p-5">
              <div className="min-w-56 flex-1 space-y-1.5">
                <Label htmlFor="room-hotel">Hotel</Label>
                <Select value={selectedHotel?.id ?? ''} onValueChange={setHotelId}>
                  <SelectTrigger id="room-hotel" aria-label="Select hotel">
                    <SelectValue placeholder="Choose a hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name} — {hotel.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="flex items-center gap-1.5 pb-2 text-sm text-muted-foreground">
                <BedDouble className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
                {hotelRooms.length} {hotelRooms.length === 1 ? 'room type' : 'room types'} listed
              </p>
            </CardContent>
          </Card>

          {hotelRooms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                  <BedDouble className="h-7 w-7" />
                </span>
                <p className="text-base font-medium text-foreground">No rooms listed yet</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Add the first room type for {selectedHotel?.name} and it will be bookable by guests immediately.
                </p>
                <Button
                  className="mt-2 gap-2"
                  onClick={() => {
                    setEditingRoom(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add a room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-5">
              {hotelRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden border-forest-700/10 transition-shadow hover:shadow-soft">
                  <div className="grid sm:grid-cols-[150px_1fr]">
                    <HotelArt art={room.images[0] ?? 'pine'} alt={`${room.name} room`} size="md" className="h-32 sm:h-full" />
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                        <div>
                          <h3 className="text-base font-semibold tracking-tight text-foreground">{room.name}</h3>
                          <p className="mt-0.5 text-sm text-muted-foreground">{room.type}</p>
                        </div>
                        <p className="text-right">
                          <span className="text-lg font-semibold text-forest-700 dark:text-forest-400">
                            {formatPrice(room.pricePerNight)}
                          </span>
                          <span className="text-xs text-muted-foreground"> / night</span>
                        </p>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0 text-forest-700 dark:text-forest-400" />
                        Sleeps {room.capacity}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {room.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setEditingRoom(room);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/40"
                          onClick={() => setDeleteTarget(room)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hotelId={selectedHotel?.id ?? ''}
        room={editingRoom}
        onSubmit={handleSaveRoom}
      />

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the room type and cancels any reservations booked for it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep room
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDeleteRoom}>
              <Trash2 className="h-4 w-4" />
              Remove room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
