import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import type { DATA } from "@/constants";

export type DurationKey = keyof typeof DATA.pricing.multipliers;

export interface TermConfig {
  dayOfWeek: DayOfWeek;
  duration: DurationKey;
}

export type TermConfigs = Partial<Record<TermKey, TermConfig>>;
