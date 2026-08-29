import { parseISO, eachDayOfInterval, getDay, format, isValid } from "date-fns";
import { YEAR_DATA, getCurrentYear, type YearData } from "@/data/terms";
import { SLOTS, SLOT_ORDER, LEVELS, DAY_IDX, DURATIONS, type SlotKey, type LevelKey, type Slot } from "@/lib/termConstants";
import { type CardConfig } from "@/components/TermCard";
import { type Lang } from "@/i18n/translations";

/**
 * Query-string mirror of the calculator's editable state, so an agent (or a bookmark)
 * can reconstruct a quote without clicking through the UI. Scalars are plain params;
 * active slots are a `slots=` list; each active slot's config is one param keyed by its
 * slot key (`day.dur.start.end`, day lowercase); holiday date selections are a sibling
 * `<slot>_dates=` param of comma-joined `MMdd` tokens (unambiguous — every range here
 * spans under a year, so month+day never repeats within one slot's date list).
 *
 * Decoding never throws: every field falls back to its calculator default independently,
 * because a URL built by fuzzing or hand-editing is the expected input, not the exception.
 */

export type UrlState = {
  year: number;
  lang: Lang;
  loyal: boolean;
  level: LevelKey;
  globalCredit: string;
  globalDebit: string;
  active: SlotKey[];
  configs: Partial<Record<SlotKey, CardConfig>>;
};

function slotRange(slot: Slot, data: YearData) {
  if (slot.isHols) {
    const holKey = slot.termKey === "term_4" ? ("summer" as const) : slot.termKey;
    return data.holidays[holKey];
  }
  return data.terms[slot.termKey];
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && isValid(parseISO(s));
}

// ISO yyyy-MM-dd strings compare correctly with plain string ordering.
function withinRange(d: string, range: { start: string; end: string }): boolean {
  return d >= range.start && d <= range.end;
}

function parseDay(raw: string): string | null {
  return Object.keys(DAY_IDX).find(d => d.toLowerCase() === raw.toLowerCase()) ?? null;
}

function defaultConfig(slot: Slot, range: { start: string; end: string }): CardConfig {
  const selectedDates =
    slot.isHols && slot.isGR
      ? eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
          .filter(d => getDay(d) === DAY_IDX.Sunday)
          .map(d => format(d, "yyyy-MM-dd"))
      : [];
  return slot.isGR
    ? { day: "Sunday", dur: "1.5h", start: range.start, end: range.end, groupReading: true, selectedDates }
    : { day: "Monday", dur: "1h", start: range.start, end: range.end, groupReading: false, selectedDates };
}

export function decodeUrlState(search: string): UrlState {
  const p = new URLSearchParams(search);

  const yearRaw = Number(p.get("year"));
  const year = YEAR_DATA[yearRaw] ? yearRaw : getCurrentYear();
  const data = YEAR_DATA[year];

  const lang: Lang = p.get("lang") === "zh" ? "zh" : "en";
  const loyal = p.get("client") !== "new";
  const levelRaw = p.get("level");
  const level: LevelKey = levelRaw && levelRaw in LEVELS ? (levelRaw as LevelKey) : "grade_7_10";
  const globalCredit = p.get("credit") ?? "";
  const globalDebit = p.get("debit") ?? "";

  const requested = (p.get("slots") ?? "").split(",").map(s => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const active: SlotKey[] = [];
  const configs: Partial<Record<SlotKey, CardConfig>> = {};

  for (const key of requested) {
    if (seen.has(key)) continue;
    const slot = SLOTS.find(s => s.key === key);
    if (!slot) continue;
    seen.add(key);
    active.push(slot.key);

    const range = slotRange(slot, data);
    const config = defaultConfig(slot, range);

    const raw = p.get(slot.key);
    const parts = raw?.split(".") ?? [];
    if (parts.length === 4) {
      const [dayRaw, durRaw, startRaw, endRaw] = parts;
      const day = parseDay(dayRaw);
      if (day) config.day = day;
      if (durRaw in DURATIONS) config.dur = durRaw;
      if (
        isIsoDate(startRaw) && isIsoDate(endRaw) && startRaw <= endRaw &&
        withinRange(startRaw, range) && withinRange(endRaw, range)
      ) {
        config.start = startRaw;
        config.end = endRaw;
      }
    }

    if (slot.isHols) {
      const datesRaw = p.get(`${slot.key}_dates`);
      if (datesRaw) {
        const byMMDD = new Map(
          eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
            .map(d => [format(d, "MMdd"), format(d, "yyyy-MM-dd")])
        );
        const phSet = new Set(data.publicHolidays.map(h => h.date));
        const tokens = new Set(datesRaw.split(",").map(t => t.trim()).filter(Boolean));
        config.selectedDates = [...tokens]
          .map(t => byMMDD.get(t))
          .filter((d): d is string => !!d && !phSet.has(d));
      }
    }

    configs[slot.key] = config;
  }

  return { year, lang, loyal, level, globalCredit, globalDebit, active, configs };
}

export function encodeUrlState(s: UrlState): string {
  const p = new URLSearchParams();
  p.set("year", String(s.year));
  p.set("lang", s.lang);
  p.set("client", s.loyal ? "loyalty" : "new");
  p.set("level", s.level);
  if (s.globalCredit) p.set("credit", s.globalCredit);
  if (s.globalDebit) p.set("debit", s.globalDebit);

  if (s.active.length) {
    p.set("slots", [...s.active].sort((a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]).join(","));
  }
  for (const key of s.active) {
    const c = s.configs[key];
    if (!c) continue;
    p.set(key, `${c.day.toLowerCase()}.${c.dur}.${c.start}.${c.end}`);
    const slot = SLOTS.find(sl => sl.key === key)!;
    if (slot.isHols && c.selectedDates.length) {
      p.set(`${key}_dates`, c.selectedDates.map(d => format(parseISO(d), "MMdd")).join(","));
    }
  }
  return p.toString();
}
