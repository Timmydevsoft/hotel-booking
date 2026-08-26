import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

/**
 * Comma-separated amenities input with removable chips. The text field
 * parses on every keystroke, so the value is always a clean string array
 * and chips can be removed one at a time.
 */

interface AmenitiesEditorProps {
  id: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export default function AmenitiesEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
}: AmenitiesEditorProps) {
  function handleInput(raw: string) {
    const next = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    onChange(next);
  }

  function removeItem(removed: string) {
    onChange(value.filter((item) => item !== removed));
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value.join(', ')}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={placeholder ?? 'Separate each item with a comma'}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => removeItem(item)}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              {item}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
