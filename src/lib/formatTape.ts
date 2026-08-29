import { type Translations } from "@/i18n/translations";
import { type QuoteData, type QuoteSlot } from "@/lib/calculate";

/**
 * `field`/`value` land on the DOM as `data-field` / `data-value` so the rendered
 * quote is machine-readable without re-parsing the display text.
 */
export type TapeLine = { text: string; warn?: boolean; field?: string; value?: string };

const rule = (): TapeLine => ({ text: "---", field: "rule" });

function range(dates: string[], tr: Translations): string {
  return dates.length ? tr.formatDateRange(dates[0], dates.at(-1)!) : "";
}

function slotLines(s: QuoteSlot, year: number, tr: Translations): TapeLine[] {
  const isHols = s.kind === "hols" || s.kind === "gr_hols";
  const tapeLabel = tr.tapeTerm(String(s.term), isHols);
  const sessions = (n: number, durKey: string, field: string): TapeLine =>
    ({ text: tr.sessions(n, tr.durLabels[durKey]), field, value: String(n) });
  const dateChips = (dates: string[]): TapeLine[] =>
    dates.map(d => ({ text: tr.formatChipDate(d), field: "session-date", value: d }));

  if (s.kind === "gr_hols") {
    return [
      { text: tr.tapeGRLabel(tapeLabel, year), field: "slot-label", value: s.slot },
      { text: tr.various, warn: true, field: "slot-schedule", value: "various" },
      ...dateChips(s.dates),
      sessions(s.sessions, s.durationKey, "slot-sessions"),
      { text: tr.subtotal(s.subtotal.toLocaleString()), field: "slot-subtotal", value: String(s.subtotal) },
    ];
  }

  if (s.kind === "gr") {
    return [
      { text: tr.tapeGRLabel(tapeLabel, year), field: "slot-label", value: s.slot },
      { text: tr.sundays, warn: true, field: "slot-schedule", value: "Sunday" },
      { text: range(s.dates, tr), field: "slot-range", value: s.dates.length ? `${s.dates[0]}/${s.dates.at(-1)}` : "" },
      sessions(s.sessions, s.durationKey, "slot-sessions"),
      { text: tr.subtotal(s.subtotal.toLocaleString()), field: "slot-subtotal", value: String(s.subtotal) },
    ];
  }

  if (s.kind === "hols") {
    return [
      { text: tr.tapeClassLabel(tapeLabel, year), field: "slot-label", value: s.slot },
      { text: tr.various, warn: true, field: "slot-schedule", value: "various" },
      ...dateChips(s.dates),
      sessions(s.sessions, s.durationKey, "slot-sessions"),
      { text: tr.subtotal(s.subtotal.toLocaleString()), field: "slot-subtotal", value: String(s.subtotal) },
    ];
  }

  const gr = s.groupReading;
  // A weekly term class prints one subtotal covering its own sessions plus any
  // group-reading block hanging off it.
  const shown = Math.round(s.subtotalExact + (gr?.subtotalExact ?? 0));
  return [
    { text: tr.tapeClassLabel(tapeLabel, year), field: "slot-label", value: s.slot },
    { text: tr.dayLine(s.day ?? ""), warn: true, field: "slot-schedule", value: s.day ?? "" },
    { text: range(s.dates, tr), field: "slot-range", value: s.dates.length ? `${s.dates[0]}/${s.dates.at(-1)}` : "" },
    sessions(s.sessions, s.durationKey, "slot-sessions"),
    ...(s.excludedHolidays.length
      ? [{
          text: tr.excludes(s.excludedHolidays.map(h => h.name.toUpperCase()).join(", ")),
          field: "slot-excludes",
          value: s.excludedHolidays.map(h => h.date).join(","),
        }]
      : []),
    ...(gr
      ? [
          rule(),
          { text: tr.tapeGRLabel(tapeLabel, year), field: "gr-label", value: s.slot },
          { text: tr.sundays, warn: true, field: "gr-schedule", value: "Sunday" },
          { text: range(gr.dates, tr), field: "gr-range", value: gr.dates.length ? `${gr.dates[0]}/${gr.dates.at(-1)}` : "" },
          sessions(gr.sessions, gr.durationKey, "gr-sessions"),
        ]
      : []),
    { text: tr.subtotal(shown.toLocaleString()), field: "slot-subtotal", value: String(shown) },
  ];
}

export function formatTape(quote: QuoteData, tr: Translations): TapeLine[] {
  const { inputs, slots, totals } = quote;
  if (!slots.length) return [];

  const days = [...new Set(slots.filter(s => s.kind === "term").map(s => s.day).filter(Boolean))] as string[];
  const discLabel = totals.discountKind === "annual" ? tr.annualDiscount : tr.multiTermDiscount;

  return [
    { text: tr.loyaltyLabel(tr.levels[inputs.level], inputs.client === "loyalty"), field: "level", value: inputs.level },
    { text: tr.daysJoined(days), field: "days", value: days.join(",") },
    rule(),
    ...slots.flatMap((s, i) => {
      const lines = slotLines(s, inputs.year, tr);
      if (i < slots.length - 1) lines.push(rule());
      return lines;
    }),
    { text: "", field: "spacer" },
    rule(),
    { text: tr.subtotal(totals.subtotal.toLocaleString()), field: "subtotal", value: String(totals.subtotal) },
    ...(totals.discount > 0
      ? [{ text: tr.discountLine(discLabel, totals.discount.toLocaleString()), field: "discount", value: String(totals.discount) }]
      : []),
    ...(totals.credit > 0
      ? [{ text: tr.creditLine(totals.credit.toLocaleString()), field: "credit", value: String(totals.credit) }]
      : []),
    ...(totals.debit > 0
      ? [{ text: tr.debitLine(totals.debit.toLocaleString()), field: "debit", value: String(totals.debit) }]
      : []),
    { text: tr.payable(totals.payable.toLocaleString()), field: "payable", value: String(totals.payable) },
  ];
}
