/**
 * Machine-readable description of `window.tutorterm`, for a caller already executing JS in
 * the page with no access to /llms.txt (the same content, aimed at readers before/without JS).
 * Keep the two in sync when the API surface changes.
 */
export function getHelp() {
  return {
    description:
      "Programmatic access to the same pure quote-calculation pipeline the UI renders from. " +
      "See /llms.txt for the URL query-string encoding and the #quote-data JSON mirror. " +
      "No JS runtime available at all? GET /api/quote?<same query params> returns " +
      "{quote, tape} over plain HTTP — no browser needed.",
    example: [
      "const t = window.tutorterm;",
      "const year = t.getCurrentYear();",
      "const data = t.yearData[year];",
      "const slot = t.slots.find(s => s.key === 'term_1');",
      "const quote = t.calculate({",
      "  active: [slot.key],",
      "  configs: { [slot.key]: { day: 'Monday', dur: '1h', start: data.terms.term_1.start,",
      "    end: data.terms.term_1.end, groupReading: false, selectedDates: [] } },",
      "  level: 'vce', loyal: true, year, data, globalCredit: '', globalDebit: '', lang: 'en',",
      "});",
      "t.formatTape(quote).map(l => l.text).join('\\n');",
    ].join("\n"),
    calculate: {
      signature: "(params: CalculateParams) => QuoteData",
      params:
        "{ active: SlotKey[], configs: Record<SlotKey, CardConfig>, level: LevelKey, loyal: boolean, " +
        "year: number, data: YearData, globalCredit: string, globalDebit: string, lang: 'en' | 'zh' }",
      SlotKey: "one of tutorterm.slots[].key, e.g. 'term_1' | 'gr_1' | 'hols_1' | 'gr_hols_1' (n = 1..4)",
      CardConfig:
        "{ day: 'Monday'..'Sunday', dur: one of Object.keys(tutorterm.durations), " +
        "start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', groupReading: boolean, selectedDates: 'YYYY-MM-DD'[] }",
      level: "one of Object.keys(tutorterm.levels)",
    },
    formatTape: {
      signature: "(quote: QuoteData) => {text: string, warn?: boolean, field?: string, value?: string}[]",
      note: "Resolves the translations from quote.inputs.lang automatically — no separate lang argument.",
    },
    referenceData: {
      yearData: "yearData[year] -> { terms, holidays, publicHolidays } — real date ranges, per year",
      getCurrentYear: "() => number",
      getAvailableYears: "() => number[]",
      slots: "[{key, termKey, isHols, isGR, n}, ...] — every valid slot key",
      levels: "{ [levelKey]: { rates: [loyaltyRate, newClientRate] } }",
      durations: "{ [durationKey]: hours }",
    },
  };
}
