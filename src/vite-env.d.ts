/// <reference types="vite/client" />

import type { calculate } from "@/lib/calculate";

declare const __COMMIT_HASH__: string;

declare global {
  interface Window {
    /** Programmatic access to the same pure function the UI calls — see Phase 6 of the a11y plan. */
    tutorterm: { calculate: typeof calculate; version: string };
  }
}
