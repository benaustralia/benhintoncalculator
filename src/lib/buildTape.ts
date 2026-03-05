import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { type TapeLine } from "@/components/Tape";
import { type CardConfig } from "@/components/TermCard";
import { type Translations } from "@/i18n/translations";
import { type YearData } from "@/data/terms";
import { SLOTS, SLOT_ORDER, LEVELS, GR_RATE, DURATIONS, DAY_IDX, DISCOUNTS, type SlotKey, type LevelKey } from "@/lib/termConstants";

type Params = {
  active: SlotKey[];
  configs: Partial<Record<SlotKey, CardConfig>>;
  level: LevelKey;
  loyal: boolean;
  year: number;
  data: YearData;
  globalCredit: string;
  globalDebit: string;
  tr: Translations;
};

function getRange(slot: typeof SLOTS[number], data: YearData) {
  if (slot.isHols) {
    const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
    return data.holidays[holKey];
  }
  return data.terms[slot.termKey];
}

export function buildTape({ active, configs, level, loyal, year, data, globalCredit, globalDebit, tr }: Params): { tape: TapeLine[]; total: number } {
  if (!active.length) return { tape: [], total: 0 };

  const rate = LEVELS[level].rates[loyal ? 0 : 1];
  const termCount = active.filter(k => k.startsWith("term_")).length;
  const disc = DISCOUNTS[Math.min(termCount - 1, 3)] || 0;
  const discLabel = termCount === 4 ? tr.annualDiscount : tr.multiTermDiscount;
  const credit = parseFloat(globalCredit) || 0;
  const debit = parseFloat(globalDebit) || 0;

  let cost = 0;
  const sorted = [...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]);

  const slotLineGroups: TapeLine[][] = sorted.map((k, i) => {
    const c = configs[k];
    if (!c) return [];
    const slot = SLOTS.find(s => s.key === k)!;
    const range = getRange(slot, data);
    const cs = parseISO(c.start), ce = parseISO(c.end);
    const lines: TapeLine[] = [];
    const tapeLabel = tr.tapeTerm(String(slot.termKey.slice(-1)), slot.isHols);

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
          { text: tr.tapeGRLabel(tapeLabel, year) },
          { text: tr.various, warn: true },
          ...grDates.map(d => ({ text: tr.formatChipDate(d) })),
          { text: tr.sessions(grDates.length, tr.durLabels["1.5h"]) },
          { text: tr.subtotal(Math.round(grCost).toLocaleString()) },
        );
      } else {
        const grRange = grDates.length ? tr.formatDateRange(grDates[0], grDates.at(-1)!) : "";
        lines.push(
          { text: tr.tapeGRLabel(tapeLabel, year) },
          { text: tr.sundays, warn: true },
          { text: grRange },
          { text: tr.sessions(grDates.length, tr.durLabels["1.5h"]) },
          { text: tr.subtotal(Math.round(grCost).toLocaleString()) },
        );
      }
    } else if (slot.isHols) {
      const phSet = new Set(data.publicHolidays.map(h => h.date));
      const dates = c.selectedDates.filter(d => !phSet.has(d));
      const sessionCost = rate * dates.length * DURATIONS[c.dur];
      cost += sessionCost;
      lines.push(
        { text: tr.tapeClassLabel(tapeLabel, year) },
        { text: tr.various, warn: true },
        ...dates.map(d => ({ text: tr.formatChipDate(d) })),
        { text: tr.sessions(dates.length, tr.durLabels[c.dur]) },
        { text: tr.subtotal(Math.round(sessionCost).toLocaleString()) },
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
      const sessionCost = rate * dates.length * DURATIONS[c.dur];
      const dateRange = dates.length ? tr.formatDateRange(dates[0], dates.at(-1)!) : "";
      lines.push(
        { text: tr.tapeClassLabel(tapeLabel, year) },
        { text: tr.dayLine(c.day), warn: true },
        { text: dateRange },
        { text: tr.sessions(dates.length, tr.durLabels[c.dur]) },
        ...(hols.length ? [{ text: tr.excludes(hols.join(", ")) }] : []),
      );
      let grCost = 0;
      if (c.groupReading) {
        const grDates = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
          .filter(d => getDay(d) === DAY_IDX.Sunday && d >= cs && d <= ce)
          .map(d => format(d, "yyyy-MM-dd"));
        grCost = GR_RATE * grDates.length * 1.5;
        const grRange = grDates.length ? tr.formatDateRange(grDates[0], grDates.at(-1)!) : "";
        lines.push(
          { text: "---" },
          { text: tr.tapeGRLabel(tapeLabel, year) },
          { text: tr.sundays, warn: true },
          { text: grRange },
          { text: tr.sessions(grDates.length, tr.durLabels["1.5h"]) },
        );
      }
      cost += sessionCost + grCost;
      lines.push({ text: tr.subtotal(Math.round(sessionCost + grCost).toLocaleString()) });
    }

    if (i < sorted.length - 1) lines.push({ text: "---" });
    return lines;
  });

  const sub = Math.round(cost);
  const total = Math.max(0, sub - disc - credit + debit);
  const days = [...new Set(sorted.filter(k => {
    const s = SLOTS.find(sl => sl.key === k);
    return s && !s.isGR && !s.isHols;
  }).map(k => configs[k]?.day).filter(Boolean))] as string[];

  const tape: TapeLine[] = [
    { text: tr.loyaltyLabel(tr.levels[level], loyal) },
    { text: tr.daysJoined(days) },
    { text: "---" },
    ...slotLineGroups.flat(),
    { text: "" },
    { text: "---" },
    { text: tr.subtotal(sub.toLocaleString()) },
    ...(disc > 0 ? [{ text: tr.discountLine(discLabel, disc.toLocaleString()) }] : []),
    ...(credit > 0 ? [{ text: tr.creditLine(credit.toLocaleString()) }] : []),
    ...(debit > 0 ? [{ text: tr.debitLine(debit.toLocaleString()) }] : []),
    { text: tr.payable(total.toLocaleString()) },
  ];
  return { tape, total };
}
