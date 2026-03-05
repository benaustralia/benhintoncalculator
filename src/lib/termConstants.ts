import { type PeriodKey } from "@/data/terms";

export type SlotKey = `term_${1 | 2 | 3 | 4}` | `hols_${1 | 2 | 3 | 4}` | `gr_${1 | 2 | 3 | 4}` | `gr_hols_${1 | 2 | 3 | 4}`;

export type Slot = { key: SlotKey; termKey: PeriodKey; isHols: boolean; isGR: boolean; n: number };

export const SLOTS: Slot[] = [1, 2, 3, 4].flatMap(n => [
  { key: `term_${n}` as SlotKey, termKey: `term_${n}` as PeriodKey, isHols: false, isGR: false, n },
  { key: `gr_${n}` as SlotKey, termKey: `term_${n}` as PeriodKey, isHols: false, isGR: true, n },
  { key: `hols_${n}` as SlotKey, termKey: `term_${n}` as PeriodKey, isHols: true, isGR: false, n },
  { key: `gr_hols_${n}` as SlotKey, termKey: `term_${n}` as PeriodKey, isHols: true, isGR: true, n },
]);

export const SLOT_ORDER: Record<string, number> = Object.fromEntries(SLOTS.map((s, i) => [s.key, i]));

export const LEVELS = {
  prep_6: { rates: [75, 85] },
  grade_7_10: { rates: [82, 98] },
  vce: { rates: [95, 120] },
  adult: { rates: [110, 140] },
} as const;

export type LevelKey = keyof typeof LEVELS;

export const GR_RATE = 40;
export const DURATIONS: Record<string, number> = { "45m": 0.75, "1h": 1, "1.5h": 1.5, "2h": 2 };
export const DAY_IDX: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
export const DISCOUNTS = [0, 100, 200, 300];
