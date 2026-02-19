import { useState, useMemo } from "react";
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YEAR_DATA, getCurrentYear, getAvailableYears, type PeriodKey } from "@/data/terms";
import { TermCard, type CardConfig } from "@/components/TermCard";
import { Tape } from "@/components/Tape";

type SlotKey = `term_${1 | 2 | 3 | 4}` | `hols_${1 | 2 | 3 | 4}`;

const SLOTS: { key: SlotKey; label: string; termKey: PeriodKey; isHols: boolean }[] = [1, 2, 3, 4].flatMap(n => [
  { key: `term_${n}` as SlotKey, label: `TERM ${n}`, termKey: `term_${n}` as PeriodKey, isHols: false },
  { key: `hols_${n}` as SlotKey, label: `T${n} HOLS`, termKey: `term_${n}` as PeriodKey, isHols: true },
]);

const LEVELS = {
  prep_6: { label: "PREP-6", rates: [75, 85] },
  grade_7_10: { label: "GRADE 7-10", rates: [82, 98] },
  vce: { label: "VCE", rates: [95, 120] },
  adult: { label: "ADULT", rates: [110, 140] },
} as const;
type LevelKey = keyof typeof LEVELS;

const DURATIONS: Record<string, number> = { "45m": 0.75, "1h": 1, "1.5h": 1.5, "2h": 2 };
const DUR_LABELS: Record<string, string> = { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" };
const DAY_IDX: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DISCOUNTS = [0, 100, 200, 300];
const S = { on: "bg-white text-black", off: "border border-zinc-800 text-zinc-400" };

export function TermCalculator() {
  const [year, setYear] = useState(getCurrentYear);
  const [loyal, setLoyal] = useState(true);
  const [level, setLevel] = useState<LevelKey>("grade_7_10");
  const [active, setActive] = useState<SlotKey[]>([]);
  const [configs, setConfigs] = useState<Partial<Record<SlotKey, CardConfig>>>({});

  const data = YEAR_DATA[year];

  const getRange = (slot: (typeof SLOTS)[number]) => {
    if (slot.isHols) {
      const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
      return data.holidays[holKey];
    }
    return data.terms[slot.termKey];
  };

  const toggle = (slot: (typeof SLOTS)[number]) => {
    const k = slot.key;
    if (active.includes(k)) {
      setActive(active.filter(x => x !== k));
      const { [k]: _, ...rest } = configs;
      setConfigs(rest);
    } else {
      const range = getRange(slot);
      const base = active[0] && configs[active[0]];
      setActive([...active, k]);
      setConfigs({
        ...configs,
        [k]: { day: base?.day || "Monday", dur: base?.dur || "1h", start: range.start, end: range.end, credit: "" },
      });
    }
  };

  const calc = useMemo(() => {
    if (!active.length) return { tape: "", total: 0 };
    const lv = LEVELS[level];
    const rate = lv.rates[loyal ? 0 : 1];
    const termCount = active.filter(k => k.startsWith("term_")).length;
    const disc = DISCOUNTS[Math.min(termCount - 1, 3)] || 0;
    const discLabel = termCount === 4 ? "ANNUAL DISCOUNT" : termCount >= 2 ? "MULTI-TERM DISCOUNT" : "";

    let cost = 0;
    let totalCredit = 0;
    const sorted = [...active].sort();

    const lines = sorted.map((k, i) => {
      const c = configs[k];
      if (!c) return "";
      const slot = SLOTS.find(s => s.key === k)!;
      const range = getRange(slot);
      const cs = parseISO(c.start), ce = parseISO(c.end);
      const dates: string[] = [];
      const hols: string[] = [];

      eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
        .filter(d => getDay(d) === DAY_IDX[c.day])
        .filter(d => d >= cs && d <= ce)
        .forEach(d => {
          const ds = format(d, "yyyy-MM-dd");
          const h = data.publicHolidays.find(x => x.date === ds);
          h ? hols.push(h.name.toUpperCase()) : dates.push(ds);
        });

      cost += rate * dates.length * DURATIONS[c.dur];
      totalCredit += parseFloat(c.credit) || 0;

      return [
        `${slot.label} - ${year}`,
        dates.length ? `${format(parseISO(dates[0]), "d MMM").toUpperCase()} — ${format(parseISO(dates.at(-1)!), "d MMM").toUpperCase()}` : "",
        `${dates.length} SESSIONS / ${DUR_LABELS[c.dur]}`,
        hols.length ? `EXCLUDES: ${hols.join(", ")}` : null,
        i < sorted.length - 1 ? "---" : null,
      ].filter(Boolean).join("\n");
    });

    const sub = Math.round(cost);
    const total = Math.max(0, sub - disc - totalCredit);
    const tape = [
      `${lv.label}${loyal ? " LOYALTY" : ""}`, "---", ...lines, "",
      "---",
      `SUBTOTAL $${sub.toLocaleString()}`,
      disc > 0 ? `${discLabel} -$${disc.toLocaleString()}` : null,
      totalCredit > 0 ? `CREDIT -$${totalCredit.toLocaleString()}` : null,
      `PAYABLE $${total.toLocaleString()}`,
    ].filter(Boolean).join("\n");
    return { tape, total };
  }, [active, configs, level, loyal, year, data]);

  const updateConfig = (k: SlotKey, u: Partial<CardConfig>) =>
    setConfigs({ ...configs, [k]: { ...configs[k]!, ...u } });

  const si = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";
  const btn = (on: boolean) => `flex-1 px-3 py-2 text-sm font-medium ${on ? S.on : S.off}`;

  const inputPanel = (
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Term Calculator {year}</h1>
      <select value={year} onChange={e => setYear(Number(e.target.value))} className={si}>
        {getAvailableYears().map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="flex gap-2">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => setLoyal(v)} className={btn(loyal === v)}>
            {v ? "LOYALTY" : "NEW CLIENT"}
          </button>
        ))}
      </div>
      <select value={level} onChange={e => setLevel(e.target.value as LevelKey)} className={si}>
        {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        {SLOTS.map(s => (
          <button key={s.key} onClick={() => toggle(s)} className={btn(active.includes(s.key))}>{s.label}</button>
        ))}
      </div>
      {[...active].sort().map(k => {
        const c = configs[k]; if (!c) return null;
        const slot = SLOTS.find(s => s.key === k)!;
        const range = getRange(slot);
        return <TermCard key={k} label={`${slot.label} - ${year}`} config={c} minDate={range.start} maxDate={range.end} onChange={u => updateConfig(k, u)} />;
      })}
      <div className="text-[10px] text-zinc-600">
        {(import.meta.env.VITE_COMMIT_REF || import.meta.env.VITE_GIT_COMMIT_SHA)?.substring(0, 7) || "dev"}
      </div>
    </div>
  );

  const quote = <div className="flex items-center justify-center h-full"><Tape tape={calc.tape} total={calc.total} /></div>;
  const tabCls = "flex-1 rounded-none py-3 text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-500";

  return (
    <main className="h-[100dvh] bg-black text-white">
      <div className="hidden md:flex h-full max-w-5xl mx-auto">
        <div className="flex-1 p-12 overflow-y-auto">{inputPanel}</div>
        <div className="flex-1 p-12 overflow-y-auto">{quote}</div>
      </div>
      <div className="md:hidden h-full flex flex-col">
        <Tabs defaultValue="calculator" className="flex flex-col h-full">
          <TabsList className="w-full rounded-none border-b border-zinc-800 bg-black p-0 h-auto">
            <TabsTrigger value="calculator" className={tabCls}>CALCULATOR</TabsTrigger>
            <TabsTrigger value="quote" className={tabCls}>QUOTE</TabsTrigger>
          </TabsList>
          <TabsContent value="calculator" className="flex-1 overflow-y-auto p-6 mt-0">{inputPanel}</TabsContent>
          <TabsContent value="quote" className="flex-1 overflow-y-auto p-6 mt-0">{quote}</TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
