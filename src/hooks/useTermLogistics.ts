import { DATA } from "@/constants";
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";

export type TermKey = keyof typeof DATA.term_dates | "full_year";
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

interface LogisticsResult {
  term: string;
  totalLessons: number;
  holidays: { date: string; name: string }[];
  dates: string[];
  gap: number;
  packageExpectation: number;
}

export function calculateTermLogistics(term: TermKey, dayOfWeek: DayOfWeek): LogisticsResult {
  const targetDay = DAY_MAP[dayOfWeek];
  const termsToProcess = term === "full_year"
    ? (["term_1", "term_2", "term_3", "term_4"] as const)
    : [term as keyof typeof DATA.term_dates];

  let totalLessons = 0;
  const allHolidays: { date: string; name: string }[] = [];
  const allDates: string[] = [];
  const packageExpectation = term === "full_year" ? 40 : 10;

  for (const t of termsToProcess) {
    const termData = DATA.term_dates[t];
    const start = parseISO(termData.start);
    const end = parseISO(termData.end);

    const days = eachDayOfInterval({ start, end });
    const matchDays = days.filter(d => getDay(d) === targetDay);

    for (const d of matchDays) {
      const dStr = format(d, "yyyy-MM-dd");

      // Check for holidays
      const holiday = DATA.public_holidays_excluded.find(h => h.date === dStr);

      if (holiday) {
        allHolidays.push({ date: dStr, name: holiday.name });
      } else {
        totalLessons++;
        allDates.push(dStr);
      }
    }
  }

  const gap = totalLessons - packageExpectation;

  return {
    term: term === "full_year" ? "Full Year" : term.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    totalLessons,
    holidays: allHolidays,
    dates: allDates,
    gap,
    packageExpectation
  };
}
