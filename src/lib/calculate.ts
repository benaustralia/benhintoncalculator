import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { type CardConfig } from "@/components/TermCard";
import { type Lang } from "@/i18n/translations";
import { type YearData } from "@/data/terms";
import { SLOTS, SLOT_ORDER, LEVELS, GR_RATE, DURATIONS, DAY_IDX, DISCOUNTS, type SlotKey, type LevelKey, type Slot } from "@/lib/termConstants";

/**
 * The machine-readable quote. This is the contract: `formatTape` derives every
 * displayed line from it, `Tape` mirrors it into `#quote-data`, and Phase 6 will
 * expose the producing function on `window.tutorterm`. Nothing here is localised —
 * no `Translations` are reachable from this module.
 */

export type SlotKind = "term" | "hols" | "gr" | "gr_hols";

export type GroupReading = {
  sessions: number;
  dates: string[];
  durationKey: string;
  durationMin: number;
  rate: number;
  /** Rounded for display. */
  subtotal: number;
  /** Unrounded — what actually feeds `totals.subtotal`. */
  subtotalExact: number;
};

export type QuoteSlot = {
  slot: SlotKey;
  kind: SlotKind;
  /** 1–4 — which term this slot hangs off. */
  term: number;
  /** null for holiday slots, where dates are picked individually rather than weekly. */
  day: string | null;
  durationKey: string;
  durationMin: number;
  /** The chosen date window (not the first/last session — see `dates`). */
  start: string;
  end: string;
  sessions: number;
  dates: string[];
  /** Public holidays that fell on this slot's weekday and were dropped. */
  excludedHolidays: { name: string; date: string }[];
  rate: number;
  /** This slot's own sessions, rounded — excludes `groupReading`. */
  subtotal: number;
  subtotalExact: number;
  groupReading: GroupReading | null;
};

export type QuoteTotals = {
  subtotal: number;
  discount: number;
  discountKind: "annual" | "multi-term" | "none";
  credit: number;
  debit: number;
  payable: number;
};

export type QuoteInputs = {
  year: number;
  level: LevelKey;
  client: "loyalty" | "new";
  lang: Lang;
  /** Hourly rate implied by level + client. */
  rate: number;
};

export type QuoteData = {
  inputs: QuoteInputs;
  slots: QuoteSlot[];
  totals: QuoteTotals;
};

export type CalculateParams = {
  active: SlotKey[];
  configs: Partial<Record<SlotKey, CardConfig>>;
  level: LevelKey;
  loyal: boolean;
  year: number;
  data: YearData;
  globalCredit: string;
  globalDebit: string;
  lang: Lang;
};

function getRange(slot: Slot, data: YearData) {
  if (slot.isHols) {
    const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
    return data.holidays[holKey];
  }
  return data.terms[slot.termKey];
}

function sundaysIn(range: { start: string; end: string }, from: Date, to: Date): string[] {
  return eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
    .filter(d => getDay(d) === DAY_IDX.Sunday && d >= from && d <= to)
    .map(d => format(d, "yyyy-MM-dd"));
}

export function calculate({ active, configs, level, loyal, year, data, globalCredit, globalDebit, lang }: CalculateParams): QuoteData {
  const rate = LEVELS[level].rates[loyal ? 0 : 1];
  const inputs: QuoteInputs = { year, level, client: loyal ? "loyalty" : "new", lang, rate };

  // Nothing selected quotes nothing — a standing credit/debit alone does not make a
  // quote, so it is not carried into the totals here either.
  if (!active.length) {
    return { inputs, slots: [], totals: { subtotal: 0, discount: 0, discountKind: "none", credit: 0, debit: 0, payable: 0 } };
  }

  const termCount = active.filter(k => k.startsWith("term_")).length;
  const discount = DISCOUNTS[Math.min(termCount - 1, 3)] || 0;
  const credit = parseFloat(globalCredit) || 0;
  const debit = parseFloat(globalDebit) || 0;
  const phSet = new Set(data.publicHolidays.map(h => h.date));

  let cost = 0;
  const slots: QuoteSlot[] = [];

  for (const k of [...active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b])) {
    const c = configs[k];
    if (!c) continue;
    const slot = SLOTS.find(s => s.key === k)!;
    const range = getRange(slot, data);
    const from = parseISO(c.start), to = parseISO(c.end);
    const kind: SlotKind = slot.isGR ? (slot.isHols ? "gr_hols" : "gr") : (slot.isHols ? "hols" : "term");
    const base = { slot: k, kind, term: slot.n, start: c.start, end: c.end };

    if (slot.isGR) {
      const dates = slot.isHols ? c.selectedDates.filter(d => !phSet.has(d)) : sundaysIn(range, from, to);
      const exact = GR_RATE * dates.length * 1.5;
      cost += exact;
      slots.push({
        ...base, day: slot.isHols ? null : "Sunday", durationKey: "1.5h", durationMin: 90,
        sessions: dates.length, dates, excludedHolidays: [], rate: GR_RATE,
        subtotal: Math.round(exact), subtotalExact: exact, groupReading: null,
      });
    } else if (slot.isHols) {
      const dates = c.selectedDates.filter(d => !phSet.has(d));
      const exact = rate * dates.length * DURATIONS[c.dur];
      cost += exact;
      slots.push({
        ...base, day: null, durationKey: c.dur, durationMin: DURATIONS[c.dur] * 60,
        sessions: dates.length, dates, excludedHolidays: [], rate,
        subtotal: Math.round(exact), subtotalExact: exact, groupReading: null,
      });
    } else {
      const dates: string[] = [];
      const excludedHolidays: { name: string; date: string }[] = [];
      eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
        .filter(d => getDay(d) === DAY_IDX[c.day])
        .filter(d => d >= from && d <= to)
        .forEach(d => {
          const ds = format(d, "yyyy-MM-dd");
          const h = data.publicHolidays.find(x => x.date === ds);
          if (h) excludedHolidays.push({ name: h.name, date: h.date });
          else dates.push(ds);
        });
      const exact = rate * dates.length * DURATIONS[c.dur];

      let groupReading: GroupReading | null = null;
      if (c.groupReading) {
        const grDates = sundaysIn(range, from, to);
        const grExact = GR_RATE * grDates.length * 1.5;
        groupReading = {
          sessions: grDates.length, dates: grDates, durationKey: "1.5h", durationMin: 90,
          rate: GR_RATE, subtotal: Math.round(grExact), subtotalExact: grExact,
        };
      }

      cost += exact + (groupReading?.subtotalExact ?? 0);
      slots.push({
        ...base, day: c.day, durationKey: c.dur, durationMin: DURATIONS[c.dur] * 60,
        sessions: dates.length, dates, excludedHolidays, rate,
        subtotal: Math.round(exact), subtotalExact: exact, groupReading,
      });
    }
  }

  // Rounding happens once, on the accumulated exact cost — so a sum of the per-slot
  // rounded subtotals can differ from `totals.subtotal` by a dollar. `subtotalExact`
  // is exposed so consumers can reconcile.
  const subtotal = Math.round(cost);
  const payable = Math.max(0, subtotal - discount - credit + debit);

  return {
    inputs,
    slots,
    totals: {
      subtotal, discount,
      discountKind: discount > 0 ? (termCount === 4 ? "annual" : "multi-term") : "none",
      credit, debit, payable,
    },
  };
}
