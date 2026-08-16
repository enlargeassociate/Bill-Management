import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/**
 * Auto-format a raw numeric/slash string into DD/MM/YYYY as the user types.
 * Inserts slashes automatically after DD and MM positions.
 */
function autoFormatDate(input: string, prevValue: string): string {
  // Only keep digits and slashes
  const digitsOnly = input.replace(/[^\d]/g, "");

  // Limit to 8 digits max (DDMMYYYY)
  const limited = digitsOnly.slice(0, 8);

  // Build formatted string with auto-inserted slashes
  let formatted = "";
  for (let i = 0; i < limited.length; i++) {
    if (i === 2 || i === 4) {
      formatted += "/";
    }
    formatted += limited[i];
  }

  return formatted;
}

/**
 * Try to parse a DD/MM/YYYY string to yyyy-MM-dd format.
 * Returns null if invalid.
 */
function parseDisplayToISO(display: string): string | null {
  if (display.length !== 10) return null;
  const parsed = parse(display, "dd/MM/yyyy", new Date());
  if (!isValid(parsed)) return null;
  // Additional check: ensure the parsed date matches (avoid date overflow like 32/01/2024)
  const formatted = format(parsed, "dd/MM/yyyy");
  if (formatted !== display) return null;
  return format(parsed, "yyyy-MM-dd");
}

/**
 * Convert yyyy-MM-dd to DD/MM/YYYY for display.
 */
function isoToDisplay(iso: string): string {
  try {
    const parsed = parse(iso, "yyyy-MM-dd", new Date());
    if (!isValid(parsed)) return iso;
    return format(parsed, "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

interface DateInputProps {
  /** Value in yyyy-MM-dd format (or raw string while typing) */
  value: string;
  /** Called with yyyy-MM-dd when valid, or raw display string while typing */
  onChange: (value: string) => void;
  className?: string;
}

export function DateInput({ value, onChange, className }: DateInputProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Track the display value separately so auto-format works smoothly
  const [displayValue, setDisplayValue] = useState(() =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? isoToDisplay(value) : value || ""
  );

  // Sync display when value changes externally (e.g. calendar pick, form reset)
  const expectedDisplay = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? isoToDisplay(value) : "";
  // If the external value changed and our display doesn't match, sync it
  const isExternalSync =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) && displayValue !== expectedDisplay;
  const shownValue = isExternalSync ? expectedDisplay : displayValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = autoFormatDate(raw, shownValue);
    setDisplayValue(formatted);

    // Try to parse as a complete date
    const iso = parseDisplayToISO(formatted);
    if (iso) {
      onChange(iso);
    } else {
      // Pass the raw formatted display value so form knows it's incomplete
      onChange(formatted);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const iso = format(date, "yyyy-MM-dd");
      const display = format(date, "dd/MM/yyyy");
      setDisplayValue(display);
      onChange(iso);
    } else {
      setDisplayValue("");
      onChange("");
    }
    setCalendarOpen(false);
  };

  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      <Input
        placeholder="DD/MM/YYYY"
        value={shownValue}
        onChange={handleChange}
        maxLength={10}
        className="h-10"
      />
      <Popover modal={true} open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              value && /^\d{4}-\d{2}-\d{2}$/.test(value)
                ? parse(value, "yyyy-MM-dd", new Date())
                : undefined
            }
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
