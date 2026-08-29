import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";
import { TRANSLATIONS, type Lang } from "@/i18n/translations";

const S = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";

export type CardConfig = {
  day: string; dur: string; start: string; end: string; groupReading: boolean; selectedDates: string[];
};

type Props = {
  idPrefix: string;
  label: string;
  config: CardConfig;
  minDate: string;
  maxDate: string;
  onChange: (update: Partial<CardConfig>) => void;
  isGR?: boolean;
  isHols?: boolean;
  allHolDates?: string[];
  publicHolidays?: string[];
  lang: Lang;
};

export function TermCard({ idPrefix, label, config, minDate, maxDate, onChange, isGR, isHols, allHolDates, publicHolidays, lang }: Props) {
  const tr = TRANSLATIONS[lang];
  const lbl = "block text-[11px] font-medium uppercase tracking-wide text-zinc-500 mb-1";
  const dayId = `${idPrefix}-day`;
  const durId = `${idPrefix}-dur`;

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
            <div>
              <label htmlFor={durId} className={lbl}>{tr.labels.duration}</label>
              <select id={durId} name="duration" value={config.dur} onChange={e => onChange({ dur: e.target.value })} className={S}>
                {Object.entries(tr.durLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {(allHolDates || []).map(d => {
              const isPH = (publicHolidays || []).includes(d);
              const isSelected = config.selectedDates.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => !isPH && toggleDate(d)}
                  disabled={isPH}
                  aria-pressed={isSelected}
                  className={`px-2 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${isPH ? "border border-zinc-800 text-zinc-600 cursor-not-allowed" : isSelected ? "bg-white text-black" : "border border-zinc-800 text-zinc-300"}`}
                >
                  {tr.formatChipDate(d)}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {!isGR && (
            <>
              <div>
                <label htmlFor={dayId} className={lbl}>{tr.labels.day}</label>
                <select id={dayId} name="day" value={config.day} onChange={e => onChange({ day: e.target.value })} className={S}>
                  {tr.days.map(d => <option key={d} value={d}>{tr.dayDisplay(d)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={durId} className={lbl}>{tr.labels.duration}</label>
                <select id={durId} name="duration" value={config.dur} onChange={e => onChange({ dur: e.target.value })} className={S}>
                  {Object.entries(tr.durLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePicker value={config.start} onChange={d => onChange({ start: d })} minDate={minDate} maxDate={maxDate} placeholder={tr.startPlaceholder} />
            </div>
            <div className="flex-1">
              <DatePicker value={config.end} onChange={d => onChange({ end: d })} minDate={minDate} maxDate={maxDate} placeholder={tr.endPlaceholder} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
