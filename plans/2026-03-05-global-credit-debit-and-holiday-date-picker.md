# Plan: Global Credit/Debit + Holiday Date Checklist

**Date:** 2026-03-05
**Status:** TODO

---

## Feature 1: Global Credit/Debit

### Problem
Each TermCard currently has its own Credit and Debit inputs. This is repetitive — in practice adjustments apply to the whole invoice, not a single slot.

### Decision
- Remove `credit` and `debit` from `CardConfig`
- Add top-level state `{ credit: string, debit: string }` in `TermCalculator`
- Render two inputs (CREDIT / DEBIT) below the slot toggle grid, above the TermCards
- Tape calc already treats them as a single total — just change the source

### Changes

| File | Change |
|------|--------|
| `src/components/TermCard.tsx` | Remove `credit`/`debit` from `CardConfig` type; remove Input fields from render |
| `src/components/TermCalculator.tsx` | Add `globalCredit`/`globalDebit` state; remove credit/debit from config defaults; render two inputs below slot grid; update tape calc to use global values |

---

## Feature 2: Holiday Date Checklist (Option B)

### Problem
Holiday classes and Group Reading are often irregular — a single day-of-week + date range doesn't capture "only these specific dates". Currently the calc generates every occurrence of the chosen weekday, which overestimates.

### Decision
For `isHols: true` slots (both CLASS and READ), replace the day-of-week dropdown + date range with a **date checklist**:
- Enumerate every date in the holiday period (`range.start` to `range.end`)
- Render each as a toggleable chip
- Store selected dates as `string[]` in config
- Tape and cost calc use the selected dates directly (no day-of-week filter)

GR holiday slots (isGR + isHols): same checklist, but only Sundays are shown pre-checked by default (user can uncheck).
Non-GR holiday slots (CLASS): all dates shown, none pre-checked.

### CardConfig changes

```ts
export type CardConfig = {
  day: string;        // kept for non-hols CLASS slots only
  dur: string;        // kept for non-hols CLASS slots only
  start: string;      // kept for non-hols slots (defines window)
  end: string;        // kept for non-hols slots
  groupReading: boolean; // kept but only used in legacy path (can deprecate later)
  selectedDates: string[]; // NEW — used when isHols: true
};
```

### toggle() defaults for hols slots

```ts
// Non-GR hols: selectedDates = [] (user picks all)
// GR hols: selectedDates = all Sundays in range (pre-populated, user can remove)
```

### Checklist UI (rendered inside TermCard when isHols)

```tsx
// Replace day selector + date pickers with:
<div className="flex flex-wrap gap-1">
  {allDates.map(d => (
    <button key={d}
      onClick={() => toggleDate(d)}
      className={`px-2 py-1 text-xs font-medium ${selected.includes(d) ? "bg-white text-black" : "border border-zinc-800 text-zinc-300"}`}>
      {format(parseISO(d), "EEE d MMM").toUpperCase()}
    </button>
  ))}
</div>
```

`allDates` = eachDayOfInterval over the full holiday range (no filtering by weekday).

### Calc loop changes

```ts
if (slot.isHols) {
  const dates = c.selectedDates.filter(d => !data.publicHolidays.find(h => h.date === d));
  // cost from dates.length * dur * rate (CLASS) or dates.length * 1.5 * GR_RATE (GR)
  // tape: date range from first/last selected date
  // exclude public holidays from selectedDates same as existing logic
}
```

### TermCard prop changes

- Add `allHolDates?: string[]` prop (pre-computed list of dates for the holiday period)
- When `isHols`: render checklist instead of day/date-range controls
- When `!isHols`: existing controls unchanged

### Files to Change

| File | Change |
|------|--------|
| `src/components/TermCard.tsx` | Add `allHolDates` prop; render date checklist when `isHols`; hide day selector, duration, date pickers |
| `src/components/TermCalculator.tsx` | Update `toggle()` defaults for hols; pass `allHolDates` to TermCard; update calc loop to use `selectedDates`; precompute allHolDates from range |

---

## Open Questions

- Should holiday CLASS checklist default to all-selected or none-selected? **None** (user opts in to each session date)
- Should holiday GR checklist default to Sundays pre-selected? **Yes** (matches current auto-Sunday logic, user can deselect)
- Should public holidays be hidden from the checklist or shown greyed out? **Shown greyed out / disabled** — so user can see why a date is missing

---

## Implementation Order

1. Global credit/debit (simple, no type complexity)
2. Add `selectedDates` to `CardConfig` and update `toggle()` defaults
3. Update `TermCard` to render checklist when `isHols`
4. Update calc loop to branch on `isHols` using `selectedDates`
5. Verify build passes
