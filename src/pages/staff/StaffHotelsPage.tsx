import { useEffect, useState, type FormEvent } from 'react';
import { Building2, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react';
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
import { Textarea } from '../../components/ui/Textarea';
import HotelArt from '../../components/HotelArt';
import StarRating from '../../components/StarRating';
import { createHotel, deleteHotel, updateHotel, type HotelDraft } from '../../services/staff';
import { useDataStore } from '../../store/data';
import type { Hotel } from '../../types';
import { cn } from '../../lib/utils';

const ART_OPTIONS = ['pine', 'canopy', 'cabin', 'meadow', 'stone', 'lake'];

type Notice = { tone: 'success' | 'error'; message: string } | null;

interface HotelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The hotel being edited, or null when adding a new one. */
  hotel: Hotel | null;
  /** Returns an error message to show in the dialog, or null on success. */
  onSubmit: (draft: HotelDraft) => string | null;
}

function HotelFormDialog({ open, onOpenChange, hotel, onSubmit }: HotelFormDialogProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState('4');
  const [amenities, setAmenities] = useState('');
  const [art, setArt] = useState('pine');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFormError('');
    if (hotel) {
      setName(hotel.name);
      setCity(hotel.city);
      setCountry(hotel.country);
      setAddress(hotel.address);
      setDescription(hotel.description);
      setStarRating(String(hotel.starRating));
      setAmenities(hotel.amenities.join(', '));
      setArt(hotel.images[0] ?? 'pine');
    } else {
      setName('');
      setCity('');
      setCountry('');
      setAddress('');
      setDescription('');
      setStarRating('4');
      setAmenities('');
      setArt('pine');
    }
  }, [open, hotel]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const draft: HotelDraft = {
      name: name.trim(),
      city: city.trim(),
      country: country.trim(),
      address: address.trim(),
      description: description.trim(),
      amenities: amenities
        .split(',')
        .map((amenity) => amenity.trim())
        .filter(Boolean),
      images: [art],
      starRating: Number(starRating),
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
          <DialogTitle>{hotel ? `Edit ${hotel.name}` : 'Add a hotel'}</DialogTitle>
          <DialogDescription>
            {hotel
              ? 'Update the property details — changes appear on the guest site immediately.'
              : 'Add a new property to the Evergreen catalogue.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hotel-name">Hotel name</Label>
              <Input id="hotel-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-city">City</Label>
              <Input id="hotel-city" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-country">Country</Label>
              <Input id="hotel-country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hotel-address">Address</Label>
              <Input id="hotel-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hotel-description">Description</Label>
              <Textarea
                id="hotel-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-stars">Star rating</Label>
              <Select value={starRating} onValueChange={setStarRating}>
                <SelectTrigger id="hotel-stars" aria-label="Star rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} star{n === 1 ? '' : 's'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-art">Cover image</Label>
              <Select value={art} onValueChange={setArt}>
                <SelectTrigger id="hotel-art" aria-label="Cover image">
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
              <HotelArt art={art} alt="Cover image preview" size="sm" className="h-28 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hotel-amenities">Amenities</Label>
              <Input
                id="hotel-amenities"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="Free Wi-Fi, Pool, Valet parking"
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
              {hotel ? 'Save changes' : 'Add hotel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffHotelsPage() {
  const hotels = useDataStore((s) => s.hotels);
  const rooms = useDataStore((s) => s.rooms);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function handleSaveHotel(draft: HotelDraft): string | null {
    if (editingHotel) {
      const result = updateHotel(editingHotel.id, draft);
      if (result.ok) {
        setNotice({ tone: 'success', message: `${result.record.name} was updated.` });
        return null;
      }
      return result.error;
    }
    const result = createHotel(draft);
    if (result.ok) {
      setNotice({ tone: 'success', message: `${result.record.name} was added to the catalogue.` });
      return null;
    }
    return result.error;
  }

  function handleDeleteHotel() {
    if (!deleteTarget) return;
    const result = deleteHotel(deleteTarget.id);
    setNotice(
      result.ok
        ? { tone: 'success', message: `${deleteTarget.name} was removed from the catalogue.` }
        : { tone: 'error', message: result.error }
    );
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Hotels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the Evergreen catalogue — property details, amenities, and star ratings. Changes appear on the guest
            site immediately.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingHotel(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add hotel
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
            <p className="text-base font-medium text-foreground">No hotels in the catalogue</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Add your first property and it will appear in guest search results right away.
            </p>
            <Button
              className="mt-2 gap-2"
              onClick={() => {
                setEditingHotel(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add your first hotel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => {
            const roomCount = rooms.filter((room) => room.hotelId === hotel.id).length;
            return (
              <Card
                key={hotel.id}
                className="overflow-hidden border-forest-700/10 transition-shadow hover:shadow-soft"
              >
                <HotelArt
                  art={hotel.images[0] ?? 'pine'}
                  alt={`${hotel.name} exterior`}
                  size="lg"
                  className="h-36"
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{hotel.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-forest-700 dark:text-forest-400" />
                        {hotel.city}, {hotel.country}
                      </p>
                    </div>
                    <StarRating rating={hotel.starRating} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {hotel.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <Badge variant="secondary">
                      {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setEditingHotel(hotel);
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
                        onClick={() => setDeleteTarget(hotel)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <HotelFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hotel={editingHotel}
        onSubmit={handleSaveHotel}
      />

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the hotel and all of its rooms from the catalogue. Existing reservations are
              kept for the record.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep hotel
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDeleteHotel}>
              <Trash2 className="h-4 w-4" />
              Remove hotel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
