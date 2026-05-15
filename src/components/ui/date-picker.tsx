import { lazy, Suspense } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Calendar = lazy(() => import("@/components/ui/calendar").then(m => ({ default: m.Calendar })));

type Props = {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
};

export function DatePicker({ value, onChange, minDate, maxDate, placeholder = "Pick a date" }: Props) {
  const date = value ? parseISO(value) : undefined;
  const from = minDate ? parseISO(minDate) : undefined;
  const to = maxDate ? parseISO(maxDate) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-black border-zinc-800 hover:bg-zinc-900 hover:text-white",
            !date && "text-zinc-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
        <Suspense fallback={<div className="p-4 text-sm text-zinc-400">Loading...</div>}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={d => d && onChange(format(d, "yyyy-MM-dd"))}
            defaultMonth={date || from}
            disabled={d => (from ? d < from : false) || (to ? d > to : false)}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
