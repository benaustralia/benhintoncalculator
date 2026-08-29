import { parseISO, eachDayOfInterval, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { getAvailableYears, type YearData } from "@/data/terms";
import { TermCard, type CardConfig } from "@/components/TermCard";
import { TRANSLATIONS, type Lang } from "@/i18n/translations";
import { SLOTS, SLOT_ORDER, LEVELS, type SlotKey, type LevelKey, type Slot } from "@/lib/termConstants";

const S = { on: "bg-white text-black", off: "border border-zinc-800 text-zinc-300" };

type Props = {
  lang: Lang;
  setLang: (l: Lang) => void;
  year: number;
  setYear: (y: number) => void;
  loyal: boolean;
  setLoyal: (v: boolean) => void;
  level: LevelKey;
  setLevel: (l: LevelKey) => void;
  active: SlotKey[];
  toggle: (slot: Slot) => void;
  globalCredit: string;
  setGlobalCredit: (v: string) => void;
  globalDebit: string;
  setGlobalDebit: (v: string) => void;
  configs: Partial<Record<SlotKey, CardConfig>>;
  updateConfig: (k: SlotKey, u: Partial<CardConfig>) => void;
  data: YearData;
};

export function InputPanel({ lang, setLang, year, setYear, loyal, setLoyal, level, setLevel, active, toggle, globalCredit, setGlobalCredit, globalDebit, setGlobalDebit, configs, updateConfig, data }: Props) {
  const tr = TRANSLATIONS[lang];
  const si = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";
  const focusRing = "focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2";
  const btn = (on: boolean) => `flex-1 px-3 py-2 text-sm font-medium ${on ? S.on : S.off} ${focusRing}`;
  const lbl = "block text-[11px] font-medium uppercase tracking-wide text-zinc-500 mb-1";
  const phDates = data.publicHolidays.map(h => h.date);

  const getRange = (slot: Slot) => {
    if (slot.isHols) {
      const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
      return data.holidays[holKey];
    }
    return data.terms[slot.termKey];
  };

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{tr.heading}</h1>
        <div className="flex gap-1 ml-4 shrink-0">
          {(["en", "zh"] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-2 py-1 text-xs font-medium ${lang === l ? S.on : S.off} ${focusRing}`}>
              {l === "en" ? "EN" : "中文"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="year" className={lbl}>{tr.labels.year}</label>
        <select id="year" name="year" value={year} onChange={e => setYear(Number(e.target.value))} className={si}>
          {getAvailableYears().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        {[true, false].map(v => (
          <button key={String(v)} type="button" onClick={() => setLoyal(v)} aria-pressed={loyal === v} className={btn(loyal === v)}>
            {v ? tr.loyalty : tr.newClient}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="level" className={lbl}>{tr.labels.level}</label>
        <select id="level" name="level" value={level} onChange={e => setLevel(e.target.value as LevelKey)} className={si}>
          {(Object.keys(LEVELS) as LevelKey[]).map(k => <option key={k} value={k}>{tr.levels[k]}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map(s => (
          <button key={s.key} type="button" onClick={() => toggle(s)} aria-pressed={active.includes(s.key)} className={`px-2 py-2 text-sm font-medium ${active.includes(s.key) ? S.on : S.off} ${focusRing}`}>
            {tr.slotLabel(s.n, s.isHols, s.isGR)}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="global-credit" className={lbl}>{tr.labels.credit}</label>
          <Input id="global-credit" name="credit" value={globalCredit} onChange={e => setGlobalCredit(e.target.value)} placeholder={tr.creditPlaceholder} className="bg-black border-zinc-800 text-white placeholder:text-zinc-400" />
        </div>
        <div className="flex-1">
          <label htmlFor="global-debit" className={lbl}>{tr.labels.debit}</label>
          <Input id="global-debit" name="debit" value={globalDebit} onChange={e => setGlobalDebit(e.target.value)} placeholder={tr.debitPlaceholder} className="bg-black border-zinc-800 text-white placeholder:text-zinc-400" />
        </div>
      </div>
      {[...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]).map(k => {
        const c = configs[k]; if (!c) return null;
        const slot = SLOTS.find(s => s.key === k)!;
        const range = getRange(slot);
        const allHolDates = slot.isHols
          ? eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) }).map(d => format(d, "yyyy-MM-dd"))
          : undefined;
        return (
          <TermCard key={k} idPrefix={k} label={tr.cardLabel(String(slot.n), slot.isHols, slot.isGR, year)} config={c} minDate={range.start} maxDate={range.end} onChange={u => updateConfig(k, u)} isGR={slot.isGR} isHols={slot.isHols} allHolDates={allHolDates} publicHolidays={phDates} lang={lang} />
        );
      })}
      <div className="text-[10px] text-zinc-400">
        {(import.meta.env.VITE_COMMIT_REF || import.meta.env.VITE_GIT_COMMIT_SHA)?.substring(0, 7) || "dev"}
      </div>
    </form>
  );
}
