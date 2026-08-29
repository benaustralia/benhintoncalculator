/// <reference types="vite/client" />

import type { calculate, QuoteData } from "@/lib/calculate";
import type { TapeLine } from "@/lib/formatTape";
import type { YearData } from "@/data/terms";
import type { Slot, LEVELS, DURATIONS } from "@/lib/termConstants";

declare const __COMMIT_HASH__: string;

declare global {
  interface Window {
    /** Programmatic access to the same pure functions + reference data the UI uses — see Phase 6 of the a11y plan. */
    tutorterm: {
      calculate: typeof calculate;
      formatTape: (quote: QuoteData) => TapeLine[];
      yearData: Record<number, YearData>;
      getCurrentYear: () => number;
      getAvailableYears: () => number[];
      slots: Slot[];
      levels: typeof LEVELS;
      durations: typeof DURATIONS;
      version: string;
    };
  }
}
