export type PeriodKey = "term_1" | "term_2" | "term_3" | "term_4";
export type HolidayKey = "term_1" | "term_2" | "term_3" | "summer";
type Range = { start: string; end: string };
type PublicHoliday = { name: string; date: string };

export type YearData = {
  terms: Record<PeriodKey, Range>;
  holidays: Record<HolidayKey, Range>;
  publicHolidays: PublicHoliday[];
};

export const YEAR_DATA: Record<number, YearData> = {
  2026: {
    terms: {
      term_1: { start: "2026-01-28", end: "2026-04-02" },
      term_2: { start: "2026-04-20", end: "2026-06-26" },
      term_3: { start: "2026-07-13", end: "2026-09-18" },
      term_4: { start: "2026-10-05", end: "2026-12-18" },
    },
    holidays: {
      term_1: { start: "2026-04-03", end: "2026-04-19" },
      term_2: { start: "2026-06-27", end: "2026-07-12" },
      term_3: { start: "2026-09-19", end: "2026-10-04" },
      summer: { start: "2026-12-19", end: "2027-01-26" },
    },
    publicHolidays: [
      { name: "Labour Day", date: "2026-03-09" },
      { name: "Anzac Day", date: "2026-04-25" },
      { name: "King's Birthday", date: "2026-06-08" },
      { name: "Melbourne Cup Day", date: "2026-11-03" },
    ],
  },
  2027: {
    terms: {
      term_1: { start: "2027-01-28", end: "2027-03-25" },
      term_2: { start: "2027-04-12", end: "2027-06-25" },
      term_3: { start: "2027-07-12", end: "2027-09-17" },
      term_4: { start: "2027-10-04", end: "2027-12-17" },
    },
    holidays: {
      term_1: { start: "2027-03-26", end: "2027-04-11" },
      term_2: { start: "2027-06-26", end: "2027-07-11" },
      term_3: { start: "2027-09-18", end: "2027-10-03" },
      summer: { start: "2027-12-18", end: "2028-01-26" },
    },
    publicHolidays: [
      { name: "Labour Day", date: "2027-03-08" },
      { name: "Anzac Day", date: "2027-04-25" },
      { name: "King's Birthday", date: "2027-06-14" },
      { name: "Melbourne Cup Day", date: "2027-11-02" },
    ],
  },
  2028: {
    terms: {
      term_1: { start: "2028-01-28", end: "2028-03-31" },
      term_2: { start: "2028-04-18", end: "2028-06-30" },
      term_3: { start: "2028-07-17", end: "2028-09-22" },
      term_4: { start: "2028-10-09", end: "2028-12-21" },
    },
    holidays: {
      term_1: { start: "2028-04-01", end: "2028-04-17" },
      term_2: { start: "2028-07-01", end: "2028-07-16" },
      term_3: { start: "2028-09-23", end: "2028-10-08" },
      summer: { start: "2028-12-22", end: "2029-01-28" },
    },
    publicHolidays: [
      { name: "Labour Day", date: "2028-03-13" },
      { name: "Anzac Day", date: "2028-04-25" },
      { name: "King's Birthday", date: "2028-06-12" },
      { name: "Melbourne Cup Day", date: "2028-11-07" },
    ],
  },
  2029: {
    terms: {
      term_1: { start: "2029-01-30", end: "2029-03-29" },
      term_2: { start: "2029-04-16", end: "2029-06-29" },
      term_3: { start: "2029-07-16", end: "2029-09-21" },
      term_4: { start: "2029-10-08", end: "2029-12-21" },
    },
    holidays: {
      term_1: { start: "2029-03-30", end: "2029-04-15" },
      term_2: { start: "2029-06-30", end: "2029-07-15" },
      term_3: { start: "2029-09-22", end: "2029-10-07" },
      summer: { start: "2029-12-22", end: "2030-01-28" },
    },
    publicHolidays: [
      { name: "Labour Day", date: "2029-03-12" },
      { name: "Anzac Day", date: "2029-04-25" },
      { name: "King's Birthday", date: "2029-06-11" },
      { name: "Melbourne Cup Day", date: "2029-11-06" },
    ],
  },
  2030: {
    terms: {
      term_1: { start: "2030-01-30", end: "2030-04-05" },
      term_2: { start: "2030-04-23", end: "2030-06-28" },
      term_3: { start: "2030-07-15", end: "2030-09-20" },
      term_4: { start: "2030-10-07", end: "2030-12-20" },
    },
    holidays: {
      term_1: { start: "2030-04-06", end: "2030-04-22" },
      term_2: { start: "2030-06-29", end: "2030-07-14" },
      term_3: { start: "2030-09-21", end: "2030-10-06" },
      summer: { start: "2030-12-21", end: "2031-01-28" },
    },
    publicHolidays: [
      { name: "Labour Day", date: "2030-03-11" },
      { name: "Anzac Day", date: "2030-04-25" },
      { name: "King's Birthday", date: "2030-06-10" },
      { name: "Melbourne Cup Day", date: "2030-11-05" },
    ],
  },
};

const AVAILABLE_YEARS = Object.keys(YEAR_DATA).map(Number).sort();

export function getCurrentYear(): number {
  const now = new Date().getFullYear();
  return YEAR_DATA[now] ? now : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
}

export function getAvailableYears(): number[] {
  return AVAILABLE_YEARS;
}
