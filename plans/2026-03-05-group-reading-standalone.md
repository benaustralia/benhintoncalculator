# Plan: Group Reading as Standalone Slots

**Date:** 2026-03-05
**Status:** IN PROGRESS — interrupted mid-edit, needs completion
**Trigger:** Student who only wants Group Reading (no regular tutoring)

---

## Decision Log

- GR applies to both term AND holiday periods (not just terms)
- Multi-step forms would complicate the single-panel UI — rejected
- "None" day workaround rejected: too abstract, relies on user knowing a trick
- 3-col layout rejected: GR should be available per holiday period too
- **Final decision:** 4 columns × 4 rows = 16 toggles

---

## Target Toggle Grid (4 cols × 4 rows)

```
[ T1 CLASS ]  [ T1 READ ]  [ T1 HOLS CLASS ]  [ T1 HOLS READ ]
[ T2 CLASS ]  [ T2 READ ]  [ T2 HOLS CLASS ]  [ T2 HOLS READ ]
[ T3 CLASS ]  [ T3 READ ]  [ T3 HOLS CLASS ]  [ T3 HOLS READ ]
[ T4 CLASS ]  [ T4 READ ]  [ T4 HOLS CLASS ]  [ T4 HOLS READ ]
```

- CLASS = regular tutoring session (day + duration configurable)
- READ = Group Reading (always Sunday, 1.5 hr, date range only)

---

## SlotKey Type

```ts
type SlotKey =
  | `term_${1|2|3|4}`
  | `hols_${1|2|3|4}`
  | `gr_${1|2|3|4}`
  | `gr_hols_${1|2|3|4}`;
```

## SLOTS Array (4 entries per n, drives grid-cols-4 layout)

```ts
[1,2,3,4].flatMap(n => [
  { key: `term_${n}`,     label: `T${n} CLASS`,      termKey: `term_${n}`, isHols: false, isGR: false },
  { key: `gr_${n}`,       label: `T${n} READ`,       termKey: `term_${n}`, isHols: false, isGR: true  },
  { key: `hols_${n}`,     label: `T${n} HOLS CLASS`, termKey: `term_${n}`, isHols: true,  isGR: false },
  { key: `gr_hols_${n}`,  label: `T${n} HOLS READ`,  termKey: `term_${n}`, isHols: true,  isGR: true  },
])
```

`SLOT_ORDER` (index-based) controls tape sort order: CLASS → READ → HOLS CLASS → HOLS READ per term.

---

## getRange behaviour

- `isHols: false` → term date range (`data.terms[termKey]`)
- `isHols: true` → holiday date range (`data.holidays[...]`)
- Works the same for GR slots — `isHols` drives the date range, `isGR` drives the calc path

---

## calc loop branching

```ts
if (slot.isGR) {
  // Find Sundays within cs–ce of the slot's date range
  // cost += GR_RATE * grDates.length * 1.5
  // Tape: "GROUP READING - TERM N - year" or "GROUP READING - TN HOLS - year"
  // No day warn line, no session count for tutoring
} else {
  // Existing tutoring logic (day, duration, public holidays)
  // Tape: "TERM N - year" or "TN HOLS - year" (NOT slot.label which is now "T1 CLASS")
  // Keep + GROUP READING toggle path for backward compat (though toggle removed from UI)
}
```

**Important:** Tape labels must be derived from slot properties (isHols, termKey), NOT from `slot.label` (which is the short button text like "T1 CLASS"). Use:
```ts
const termNum = slot.termKey.slice(-1);
const tapeLabel = slot.isHols ? `T${termNum} HOLS` : `TERM ${termNum}`;
// Non-GR tape: `${tapeLabel} - ${year}`
// GR tape:     `GROUP READING - ${tapeLabel} - ${year}`
```

---

## toggle() defaults

```ts
const defaults = slot.isGR
  ? { day: "Sunday", dur: "1.5h", groupReading: true }
  : { day: baseConfig?.day || "Monday", dur: baseConfig?.dur || "1h", groupReading: false };
// base = first active non-GR slot (for day/dur inheritance)
```

---

## TermCard changes

- `isGR?: boolean` prop already added
- When `isGR`: hides day selector, duration selector, `+ GROUP READING` toggle
- **TODO:** Remove `+ GROUP READING` toggle from non-GR cards too — now superseded by dedicated READ toggles. Risk: double-counting if both CLASS card GR toggle AND READ slot are active.

---

## Grid UI

```tsx
<div className="grid grid-cols-4 gap-2">
  {SLOTS.map(s => (
    <button key={s.key} onClick={() => toggle(s)}
      className={`px-2 py-2 text-sm font-medium ${active.includes(s.key) ? S.on : S.off}`}>
      {s.label}
    </button>
  ))}
</div>
```

---

## Current State (interrupted mid-edit)

**Completed:**
- SlotKey extended with `gr_hols_${1|2|3|4}` ✓
- SLOTS restructured to 4-per-row with new labels ✓
- `grid-cols-4` not yet applied (was `grid-cols-3` from previous step)

**Still TODO:**
1. Change grid to `grid-cols-4`
2. Fix tape label derivation (currently uses `slot.label` → would output "T1 CLASS - 2026" in tape)
3. Fix GR tape label to branch on `slot.isHols`
4. Remove `+ GROUP READING` button from TermCard non-GR cards
5. Fix TermCard render label (card header) to use derived label not `slot.label`
6. Verify build passes

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/TermCalculator.tsx` | SlotKey, SLOTS, grid-cols-4, tape label derivation |
| `src/components/TermCard.tsx` | Remove `+ GROUP READING` button entirely |
