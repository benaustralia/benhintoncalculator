import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import { DATA } from "@/constants";

export type DurationKey = keyof typeof DATA.durations;

export interface TermConfig {
  dayOfWeek: DayOfWeek;
  duration: DurationKey;
  startDate?: string; // ISO date string (yyyy-MM-dd) - only applies if manually set
  endDate?: string; // ISO date string (yyyy-MM-dd) - only applies if manually set
}

export type TermConfigs = Partial<Record<TermKey, TermConfig>>;
