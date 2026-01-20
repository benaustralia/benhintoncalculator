import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import { DATA } from "@/constants";

export type DurationKey = keyof typeof DATA.multipliers;

export interface TermConfig {
  dayOfWeek: DayOfWeek;
  duration: DurationKey;
}

export type TermConfigs = Partial<Record<TermKey, TermConfig>>;
