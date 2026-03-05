import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DUR_LABELS: Record<string, string> = { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" };
const S = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";

export type CardConfig = {
  day: string; dur: string; start: string; end: string; groupReading: boolean; selectedDates: string[];
};

type Props = {
  label: string;
  config: CardConfig;
  minDate: string;
  maxDate: string;
  onChange: (update: Partial<CardConfig>) => void;
  isGR?: boolean;
  isHols?: boolean;
  allHolDates?: string[];
  publicHolidays?: string[];
};

export function TermCard({ label, config, minDate, maxDate, onChange, isGR, isHols, allHolDates, publicHolidays }: Props) {
  const toggleDate = (d: string) => {
    const sel = config.selectedDates;
    onChange({ selectedDates: sel.includes(d) ? sel.filter(x => x !== d) : [...sel, d] });
  };

  return (
    <div className="border border-zinc-800 p-3 space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {isHols ? (
        <>
          {!isGR && (
            <select aria-label="Duration" value={config.dur} onChange={e => onChange({ dur: e.target.value })} className={S}>
              {Object.entries(DUR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}
          <div className="flex flex-wrap gap-1">
            {(allHolDates || []).map(d => {
              const isPH = (publicHolidays || []).includes(d);
              const isSelected = config.selectedDates.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => !isPH && toggleDate(d)}
                  disabled={isPH}
                  className={`px-2 py-1 text-xs font-medium ${isPH ? "border border-zinc-800 text-zinc-600 cursor-not-allowed" : isSelected ? "bg-white text-black" : "border border-zinc-800 text-zinc-300"}`}
                >
                  {format(parseISO(d), "EEE d MMM").toUpperCase()}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {!isGR && (
            <>
              <select aria-label="Day of week" value={config.day} onChange={e => onChange({ day: e.target.value })} className={S}>
                {DAYS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
              <select aria-label="Duration" value={config.dur} onChange={e => onChange({ dur: e.target.value })} className={S}>
                {Object.entries(DUR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePicker value={config.start} onChange={d => onChange({ start: d })} minDate={minDate} maxDate={maxDate} placeholder="Start" />
            </div>
            <div className="flex-1">
              <DatePicker value={config.end} onChange={d => onChange({ end: d })} minDate={minDate} maxDate={maxDate} placeholder="End" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
