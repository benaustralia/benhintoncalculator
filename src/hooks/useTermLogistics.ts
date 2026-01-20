import { DATA } from "@/constants";
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import type { TermConfigs } from "@/types/termConfig";

export type TermKey = keyof typeof DATA.term_dates;
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

const DAY_MAP: Record<DayOfWeek, number> = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
};

export interface TermDetails {
  term: TermKey;
  dayOfWeek: DayOfWeek;
  duration: string;
  lessons: number;
  holidays: { date: string; name: string }[];
  dates: string[];
}

export interface LogisticsResult {
  terms: string[];
  totalLessons: number;
  holidays: { date: string; name: string }[];
  dates: string[];
  gap: number;
  packageExpectation: number;
  termDetails: TermDetails[];
}

export function calculateTermLogistics(
  selectedTerms: TermKey[],
  termConfigs: TermConfigs
): LogisticsResult {
  if (selectedTerms.length === 0) {
    return {
      terms: [],
      totalLessons: 0,
      holidays: [],
      dates: [],
      gap: 0,
      packageExpectation: 0,
      termDetails: []
    };
  }

  let totalLessons = 0;
  const allHolidays: { date: string; name: string }[] = [];
  const allDates: string[] = [];
  const termDetails: TermDetails[] = [];
  const packageExpectation = selectedTerms.length * 10; // 10 lessons per term

  for (const term of selectedTerms) {
    const config = termConfigs[term];
    if (!config) continue; // Skip terms without configuration

    const targetDay = DAY_MAP[config.dayOfWeek];
    const termData = DATA.term_dates[term];
    const start = parseISO(termData.start);
    const end = parseISO(termData.end);

    const days = eachDayOfInterval({ start, end });
    const matchDays = days.filter(d => getDay(d) === targetDay);

    const termDates: string[] = [];
    const termHolidays: { date: string; name: string }[] = [];
    let termLessons = 0;

    for (const d of matchDays) {
      const dStr = format(d, "yyyy-MM-dd");

      // Check for holidays
      const holiday = DATA.public_holidays_excluded.find(h => h.date === dStr);

      if (holiday) {
        termHolidays.push({ date: dStr, name: holiday.name });
        allHolidays.push({ date: dStr, name: holiday.name });
      } else {
        termLessons++;
        termDates.push(dStr);
        allDates.push(dStr);
      }
    }

    totalLessons += termLessons;

    termDetails.push({
      term,
      dayOfWeek: config.dayOfWeek,
      duration: config.duration,
      lessons: termLessons,
      holidays: termHolidays,
      dates: termDates
    });
  }

  // Sort dates chronologically
  allDates.sort();
  
  // Sort holidays chronologically
  allHolidays.sort((a, b) => a.date.localeCompare(b.date));

  const gap = totalLessons - packageExpectation;

  const termLabels = selectedTerms.map(t => 
    t.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
  );

  return {
    terms: termLabels,
    totalLessons,
    holidays: allHolidays,
    dates: allDates,
    gap,
    packageExpectation,
    termDetails
  };
}
