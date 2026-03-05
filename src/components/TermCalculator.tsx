import { useState, useMemo } from "react";
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YEAR_DATA, getCurrentYear, getAvailableYears, type PeriodKey } from "@/data/terms";
import { TermCard, type CardConfig } from "@/components/TermCard";
import { Tape, type TapeLine } from "@/components/Tape";

type SlotKey = `term_${1 | 2 | 3 | 4}` | `hols_${1 | 2 | 3 | 4}` | `gr_${1 | 2 | 3 | 4}` | `gr_hols_${1 | 2 | 3 | 4}`;

const SLOTS: { key: SlotKey; label: string; termKey: PeriodKey; isHols: boolean; isGR: boolean }[] = [1, 2, 3, 4].flatMap(n => [
  { key: `term_${n}` as SlotKey, label: `T${n} CLASS`, termKey: `term_${n}` as PeriodKey, isHols: false, isGR: false },
  { key: `gr_${n}` as SlotKey, label: `T${n} READ`, termKey: `term_${n}` as PeriodKey, isHols: false, isGR: true },
  { key: `hols_${n}` as SlotKey, label: `T${n} HOLS CLASS`, termKey: `term_${n}` as PeriodKey, isHols: true, isGR: false },
  { key: `gr_hols_${n}` as SlotKey, label: `T${n} HOLS READ`, termKey: `term_${n}` as PeriodKey, isHols: true, isGR: true },
]);
const SLOT_ORDER: Record<string, number> = Object.fromEntries(SLOTS.map((s, i) => [s.key, i]));

const LEVELS = {
  prep_6: { label: "GRADE P-6", rates: [75, 85] },
  grade_7_10: { label: "GRADE 7-10", rates: [82, 98] },
  vce: { label: "VCE", rates: [95, 120] },
  adult: { label: "ADULT", rates: [110, 140] },
} as const;
const GR_RATE = 40; // Group Reading: $40/hr × 1.5hr = $60/session
type LevelKey = keyof typeof LEVELS;

const DURATIONS: Record<string, number> = { "45m": 0.75, "1h": 1, "1.5h": 1.5, "2h": 2 };
const DUR_LABELS: Record<string, string> = { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" };
const DAY_IDX: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DISCOUNTS = [0, 100, 200, 300];
const S = { on: "bg-white text-black", off: "border border-zinc-800 text-zinc-300" };

export function TermCalculator() {
  const [year, setYear] = useState(getCurrentYear);
  const [loyal, setLoyal] = useState(true);
  const [level, setLevel] = useState<LevelKey>("grade_7_10");
  const [active, setActive] = useState<SlotKey[]>([]);
  const [configs, setConfigs] = useState<Partial<Record<SlotKey, CardConfig>>>({});
  const [globalCredit, setGlobalCredit] = useState("");
  const [globalDebit, setGlobalDebit] = useState("");

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
      const base = active.find(k => !SLOTS.find(s => s.key === k)?.isGR);
      const baseConfig = base && configs[base];

      let selectedDates: string[] = [];
      if (slot.isHols && slot.isGR) {
        selectedDates = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
          .filter(d => getDay(d) === DAY_IDX.Sunday)
          .map(d => format(d, "yyyy-MM-dd"));
      }

      const defaults = slot.isGR
        ? { day: "Sunday", dur: "1.5h", groupReading: true }
        : { day: baseConfig?.day || "Monday", dur: baseConfig?.dur || "1h", groupReading: false };
      setActive([...active, k]);
      setConfigs({
        ...configs,
        [k]: { ...defaults, start: range.start, end: range.end, selectedDates },
      });
    }
  };

  const calc = useMemo(() => {
    if (!active.length) return { tape: [] as TapeLine[], total: 0 };
    const lv = LEVELS[level];
    const rate = lv.rates[loyal ? 0 : 1];
    const termCount = active.filter(k => k.startsWith("term_")).length;
    const disc = DISCOUNTS[Math.min(termCount - 1, 3)] || 0;
    const discLabel = termCount === 4 ? "ANNUAL DISCOUNT" : termCount >= 2 ? "MULTI-TERM DISCOUNT" : "";

    const credit = parseFloat(globalCredit) || 0;
    const debit = parseFloat(globalDebit) || 0;

    let cost = 0;
    const sorted = [...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]);

    const slotLineGroups: TapeLine[][] = sorted.map((k, i) => {
      const c = configs[k];
      if (!c) return [];
      const slot = SLOTS.find(s => s.key === k)!;
      const range = getRange(slot);
      const cs = parseISO(c.start), ce = parseISO(c.end);

      let sessionCost = 0;
      const lines: TapeLine[] = [];

      const termNum = slot.termKey.slice(-1);
      const tapeLabel = slot.isHols ? `T${termNum} HOLS` : `TERM ${termNum}`;

      if (slot.isGR) {
        let grDates: string[];
        if (slot.isHols) {
          const phSet = new Set(data.publicHolidays.map(h => h.date));
          grDates = c.selectedDates.filter(d => !phSet.has(d));
        } else {
          grDates = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
            .filter(d => getDay(d) === DAY_IDX.Sunday && d >= cs && d <= ce)
            .map(d => format(d, "yyyy-MM-dd"));
        }
        const grCost = GR_RATE * grDates.length * 1.5;
        cost += grCost;
        if (slot.isHols) {
          lines.push(
            { text: `GROUP READING - ${tapeLabel} - ${year}` },
            { text: "VARIOUS", warn: true },
            ...grDates.map(d => ({ text: format(parseISO(d), "EEE d MMM").toUpperCase() })),
            { text: `${grDates.length} SESSIONS / 1.5 HR` },
            { text: `SUBTOTAL $${Math.round(grCost).toLocaleString()}` },
          );
        } else {
          const grRange = grDates.length
            ? `${format(parseISO(grDates[0]), "d MMM").toUpperCase()} — ${format(parseISO(grDates.at(-1)!), "d MMM").toUpperCase()}`
            : "";
          lines.push(
            { text: `GROUP READING - ${tapeLabel} - ${year}` },
            { text: "SUNDAYS", warn: true },
            { text: grRange },
            { text: `${grDates.length} SESSIONS / 1.5 HR` },
            { text: `SUBTOTAL $${Math.round(grCost).toLocaleString()}` },
          );
        }
      } else if (slot.isHols) {
        const phSet = new Set(data.publicHolidays.map(h => h.date));
        const dates = c.selectedDates.filter(d => !phSet.has(d));
        sessionCost = rate * dates.length * DURATIONS[c.dur];
        cost += sessionCost;
        lines.push(
          { text: `${tapeLabel} - ${year}` },
          { text: "VARIOUS", warn: true },
          ...dates.map(d => ({ text: format(parseISO(d), "EEE d MMM").toUpperCase() })),
          { text: `${dates.length} SESSIONS / ${DUR_LABELS[c.dur]}` },
          { text: `SUBTOTAL $${Math.round(sessionCost).toLocaleString()}` },
        );
      } else {
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

        sessionCost = rate * dates.length * DURATIONS[c.dur];
        const dateRange = dates.length
          ? `${format(parseISO(dates[0]), "d MMM").toUpperCase()} — ${format(parseISO(dates.at(-1)!), "d MMM").toUpperCase()}`
          : "";

        lines.push(
          { text: `${tapeLabel} - ${year}` },
          { text: `${c.day.toUpperCase()}S`, warn: true },
          { text: dateRange },
          { text: `${dates.length} SESSIONS / ${DUR_LABELS[c.dur]}` },
          ...(hols.length ? [{ text: `EXCLUDES: ${hols.join(", ")}` }] : []),
        );

        let grCost = 0;
        if (c.groupReading) {
          const grDates = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
            .filter(d => getDay(d) === DAY_IDX.Sunday && d >= cs && d <= ce)
            .map(d => format(d, "yyyy-MM-dd"));
          grCost = GR_RATE * grDates.length * 1.5;
          const grRange = grDates.length
            ? `${format(parseISO(grDates[0]), "d MMM").toUpperCase()} — ${format(parseISO(grDates.at(-1)!), "d MMM").toUpperCase()}`
            : "";
          lines.push(
            { text: "---" },
            { text: `GROUP READING - ${tapeLabel} - ${year}` },
            { text: "SUNDAYS", warn: true },
            { text: grRange },
            { text: `${grDates.length} SESSIONS / 1.5 HR` },
          );
        }

        const slotSubtotal = Math.round(sessionCost + grCost);
        cost += sessionCost + grCost;
        lines.push({ text: `SUBTOTAL $${slotSubtotal.toLocaleString()}` });
      }

      if (i < sorted.length - 1) lines.push({ text: "---" });
      return lines;
    });

    const sub = Math.round(cost);
    const total = Math.max(0, sub - disc - credit + debit);
    const days = [...new Set(sorted.filter(k => {
      const s = SLOTS.find(sl => sl.key === k);
      return s && !s.isGR && !s.isHols;
    }).map(k => configs[k]?.day).filter(Boolean))];
    const daysLine = days.map(d => `${d!.toUpperCase()}S`).join(" & ");

    const tape: TapeLine[] = [
      { text: `${lv.label}${loyal ? " LOYALTY" : ""}` },
      { text: daysLine },
      { text: "---" },
      ...slotLineGroups.flat(),
      { text: "" },
      { text: "---" },
      { text: `SUBTOTAL $${sub.toLocaleString()}` },
      ...(disc > 0 ? [{ text: `${discLabel} -$${disc.toLocaleString()}` }] : []),
      ...(credit > 0 ? [{ text: `CREDIT -$${credit.toLocaleString()}` }] : []),
      ...(debit > 0 ? [{ text: `DEBIT +$${debit.toLocaleString()}` }] : []),
      { text: `PAYABLE $${total.toLocaleString()}` },
    ];
    return { tape, total };
  }, [active, configs, level, loyal, year, data, globalCredit, globalDebit]);

  const updateConfig = (k: SlotKey, u: Partial<CardConfig>) =>
    setConfigs({ ...configs, [k]: { ...configs[k]!, ...u } });

  const si = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";
  const btn = (on: boolean) => `flex-1 px-3 py-2 text-sm font-medium ${on ? S.on : S.off}`;
  const phDates = data.publicHolidays.map(h => h.date);

  const inputPanel = (
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Term Calculator {year}</h1>
      <select aria-label="Year" value={year} onChange={e => setYear(Number(e.target.value))} className={si}>
        {getAvailableYears().map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="flex gap-2">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => setLoyal(v)} className={btn(loyal === v)}>
            {v ? "LOYALTY" : "NEW CLIENT"}
          </button>
        ))}
      </div>
      <select aria-label="Student level" value={level} onChange={e => setLevel(e.target.value as LevelKey)} className={si}>
        {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map(s => (
          <button key={s.key} onClick={() => toggle(s)} className={`px-2 py-2 text-sm font-medium ${active.includes(s.key) ? S.on : S.off}`}>{s.label}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={globalCredit}
          onChange={e => setGlobalCredit(e.target.value)}
          placeholder="CREDIT ($)"
          aria-label="Credit amount"
          className="bg-black border-zinc-800 text-white placeholder:text-zinc-400"
        />
        <Input
          value={globalDebit}
          onChange={e => setGlobalDebit(e.target.value)}
          placeholder="DEBIT ($)"
          aria-label="Debit amount"
          className="bg-black border-zinc-800 text-white placeholder:text-zinc-400"
        />
      </div>
      {[...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]).map(k => {
        const c = configs[k]; if (!c) return null;
        const slot = SLOTS.find(s => s.key === k)!;
        const range = getRange(slot);
        const tn = slot.termKey.slice(-1);
        const tl = slot.isHols ? `T${tn} HOLS` : `TERM ${tn}`;
        const label = slot.isGR ? `GROUP READING - ${tl} - ${year}` : `${tl} - ${year}`;
        const allHolDates = slot.isHols
          ? eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) }).map(d => format(d, "yyyy-MM-dd"))
          : undefined;
        return (
          <TermCard
            key={k}
            label={label}
            config={c}
            minDate={range.start}
            maxDate={range.end}
            onChange={u => updateConfig(k, u)}
            isGR={slot.isGR}
            isHols={slot.isHols}
            allHolDates={allHolDates}
            publicHolidays={phDates}
          />
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

  const quote = <div className="flex items-center justify-center h-full"><Tape tape={calc.tape} total={calc.total} /></div>;
  const tabCls = "flex-1 rounded-none py-3 text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-300";

  return (
    <main data-prerendered="" className="h-[100dvh] bg-black text-white">
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
