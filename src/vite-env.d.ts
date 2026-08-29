/// <reference types="vite/client" />

import type { calculate, QuoteData } from "@/lib/calculate";
import type { TapeLine } from "@/lib/formatTape";

declare const __COMMIT_HASH__: string;

declare global {
  interface Window {
    /** Programmatic access to the same pure functions the UI calls — see Phase 6 of the a11y plan. */
    tutorterm: {
      calculate: typeof calculate;
      formatTape: (quote: QuoteData) => TapeLine[];
      version: string;
    };
  }
}
