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
  const btn = (on: boolean) => `flex-1 px-3 py-2 text-sm font-medium ${on ? S.on : S.off}`;
  const phDates = data.publicHolidays.map(h => h.date);

  const getRange = (slot: Slot) => {
    if (slot.isHols) {
      const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
      return data.holidays[holKey];
    }
    return data.terms[slot.termKey];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{tr.heading}</h1>
        <div className="flex gap-1 ml-4 shrink-0">
          {(["en", "zh"] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 text-xs font-medium ${lang === l ? S.on : S.off}`}>
              {l === "en" ? "EN" : "中文"}
            </button>
          ))}
        </div>
      </div>
      <select aria-label="Year" value={year} onChange={e => setYear(Number(e.target.value))} className={si}>
        {getAvailableYears().map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="flex gap-2">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => setLoyal(v)} className={btn(loyal === v)}>
            {v ? tr.loyalty : tr.newClient}
          </button>
        ))}
      </div>
      <select aria-label="Student level" value={level} onChange={e => setLevel(e.target.value as LevelKey)} className={si}>
        {(Object.keys(LEVELS) as LevelKey[]).map(k => <option key={k} value={k}>{tr.levels[k]}</option>)}
      </select>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map(s => (
          <button key={s.key} onClick={() => toggle(s)} className={`px-2 py-2 text-sm font-medium ${active.includes(s.key) ? S.on : S.off}`}>
            {tr.slotLabel(s.n, s.isHols, s.isGR)}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={globalCredit} onChange={e => setGlobalCredit(e.target.value)} placeholder={tr.creditPlaceholder} aria-label="Credit amount" className="bg-black border-zinc-800 text-white placeholder:text-zinc-400" />
        <Input value={globalDebit} onChange={e => setGlobalDebit(e.target.value)} placeholder={tr.debitPlaceholder} aria-label="Debit amount" className="bg-black border-zinc-800 text-white placeholder:text-zinc-400" />
      </div>
      {[...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]).map(k => {
        const c = configs[k]; if (!c) return null;
        const slot = SLOTS.find(s => s.key === k)!;
        const range = getRange(slot);
        const allHolDates = slot.isHols
          ? eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) }).map(d => format(d, "yyyy-MM-dd"))
          : undefined;
        return (
          <TermCard key={k} label={tr.cardLabel(String(slot.n), slot.isHols, slot.isGR, year)} config={c} minDate={range.start} maxDate={range.end} onChange={u => updateConfig(k, u)} isGR={slot.isGR} isHols={slot.isHols} allHolDates={allHolDates} publicHolidays={phDates} lang={lang} />
        );
      })}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
        <img src="https://img.shields.io/badge/performance-100-brightgreen" alt="Performance: 100" width="110" height="20" />
        <img src="https://img.shields.io/badge/accessibility-100-brightgreen" alt="Accessibility: 100" width="106" height="20" />
        <img src="https://img.shields.io/badge/best%20practices-100-brightgreen" alt="Best Practices: 100" width="118" height="20" />
        <img src="https://img.shields.io/badge/SEO-100-brightgreen" alt="SEO: 100" width="64" height="20" />
      </div>
      <div className="text-[10px] text-zinc-400">
        {(import.meta.env.VITE_COMMIT_REF || import.meta.env.VITE_GIT_COMMIT_SHA)?.substring(0, 7) || "dev"}
      </div>
    </div>
  );
}
