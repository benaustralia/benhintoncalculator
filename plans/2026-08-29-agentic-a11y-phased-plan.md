# Agentic-browsing & accessibility — phased plan

Source: external review of https://tutorterm-calculator.netlify.app (build `81ec0c7`, 29 Aug 2026),
verified against this repo's code the same day. Local HEAD `383eaf8` = `81ec0c7` + CI workflow only.

Ship loop: each phase is one commit, pushed to `main` (GitHub workflow pokes the Netlify build hook).
No visual design changes anywhere in this plan.

## Verification notes (review vs. code)

Confirmed: dual DOM (`TermCalculator.tsx:71-84`); unstructured `<pre>` results (`Tape.tsx`); no
`aria-live` / `aria-pressed` / URL state / visible labels / `type="button"` / `<noscript>`; `lang`
never updated on 中文 toggle; `text-red-500` warn lines borderline on black.

Corrections:
- **Focus (review §8)**: only `select:focus{outline:none}` exists (`src/index.css:42`) and it swaps
  in a white border — visible. shadcn components already have `focus-visible:ring`. Raw buttons keep
  the UA default. Work = normalize, not restore.
- **Single DOM (review §1)**: the build SSR-prerenders (`entry-server.tsx`, `scripts/prerender.mjs`),
  so `matchMedia`-conditional rendering risks hydration mismatch. Use one Radix Tabs instance with
  `forceMount` + responsive CSS instead.
- **Structured results (§2) + calculate API (§10) are one refactor**: split `buildTape.ts` into a
  pure `calculate()` returning a machine object, and a formatter deriving tape lines from it.
- **URL state (§5)** is bigger than 8 scalars: per-slot `{day,dur,start,end,selectedDates[]}` needs
  an encoding decision.

Missed by the review:
- **Copy button has no accessible name** (`Tape.tsx:29`, icon-only) — hard WCAG failure. "Copied"
  feedback is visual-only.
- **Static shields.io "100" badges** (`InputPanel.tsx:92-95`): only third-party requests on the
  page, and become false claims the moment scores move. Remove or generate from a real run.
- `aria-pressed` also belongs on the **holiday date chips** (`TermCard.tsx:48`), not just the
  lang/loyalty/slot toggles.

---

## Model & effort per phase (summary)

| Phase | Work shape | Model | Effort |
|---|---|---|---|
| 1 Quick wins | Mechanical multi-file attribute edits | Sonnet | low |
| 2 Single DOM | Radix internals + SSR-hydration judgment | Opus (or Sonnet) | high |
| 3 Calculate/format split | Keystone refactor, parity-critical | Opus | high |
| 4 Labels + form | Small edits + zh translations | Sonnet | medium |
| 5 URL state | Encoding design + fuzz-tolerant parsing | Sonnet | high |
| 6 window API | Wiring what Phase 3 built | Sonnet (Haiku ok) | low |
| 7 Verification | Test-writing Sonnet; Lighthouse/browser-driving runs delegable to Haiku subagents | Sonnet | medium |

## Phase 1 — Quick wins (one commit, no structural change)

*Model: Sonnet, low effort — mechanical edits across three components; the only care point is
putting `aria-pressed` on the right pairs.*

- [x] `type="button"` on every raw `<button>` (InputPanel ×18+, TermCard chips, Tape copy).
- [x] `aria-pressed={on}` on: EN/中文 pair, LOYALTY/NEW pair, 16 slot buttons, holiday date chips.
- [x] Copy button: `aria-label={tr.copyQuote}` (new i18n string); wrap copied-state in a
      `role="status"` so "copied" is announced.
- [x] Lang toggle side effect: `document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"`;
      translate `document.title` at the same time (added `tr.pageTitle`, en/zh).
- [x] Focus: add `focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2`
      to the shared button class helpers (`btn()`, chip classes, copy button); change
      `select:focus` → `select:focus-visible` keeping the white border.
- [x] `text-red-500` → `text-red-400` for warn tape lines.
- [x] `<noscript>` one-liner in `index.html`.
- [x] sr-only `<h2>`s for the input panel and quote panel.
- [x] `aria-live="polite"` on the Tape container (fully effective after Phase 2; harmless now —
      the hidden copy is `display:none` and stays silent).
- [x] Remove the four static shields.io badge `<img>`s (restore honestly in Phase 7 if wanted).

**Done 2026-08-29.** `npx tsc --noEmit` clean; `npm run build` clean (SSR prerender + inline-css
succeeded). Pre-existing eslint errors in `TermCalculator.tsx`/`TermCard.tsx`/`buildTape.ts`/
`button.tsx` are untouched by this phase's diff (verified against `git diff --stat`) — left for
whoever owns general lint cleanup, not in scope here.

## Phase 2 — Single DOM

*Model: Opus (or Sonnet at high effort) — the riskiest phase: Radix Tabs internals, responsive CSS
overrides, and keeping the SSR-prerender/hydration pipeline clean. Wrong choices here are subtle
(hydration mismatch, focus traps), not loud.*

- [x] Collapse `TermCalculator` to **one** Tabs instance: `forceMount` both `TabsContent`; at `md:`
      hide `TabsList` and lay both panels side-by-side (override Radix `data-[state=inactive]`
      hiding via CSS); below `md`, current tab behaviour unchanged.
- [x] Verify prerender + hydration still clean (`npm run build`, check `dist/index.html`, no
      hydration warnings in console).
- [x] Fallback (not needed): CSS-only approach worked — `max-md:data-[state=inactive]:hidden`
      compiles to `@media not all and (min-width:48rem){...}`, cleanly scoped below `md` with no
      specificity fight against the `md:*` desktop rules. `inert`/`matchMedia` fallback not required.
- Result: one H1, one set of controls, one live region.

**Extra fix beyond the checklist:** with `forceMount`, both `TabsContent`s permanently carry
`role="tabpanel"` + `aria-labelledby={triggerId}` from Radix — fine at mobile (a real tablist
governs them) but wrong at desktop, where the tablist is `md:hidden` and inert, leaving a
"tabpanel" with no operable tab behind it. Added `useIsDesktop()` (a `matchMedia` listener applied
**post-hydration only**, defaulting to `false` so SSR/first-hydration output matches — no mismatch)
that swaps each panel to `role="region"` + `aria-labelledby` pointing at its own sr-only `<h2>` id
once desktop is detected client-side.

**Done 2026-08-29.** Verified in Chrome via the local `vite preview` build: desktop shows both
panels side-by-side with live quote updates (selecting T1 CLASS → $656 total appears instantly);
mobile shows the CALCULATOR/QUOTE tab switcher and real click-driven tab switching (Radix binds
selection to `mousedown`, confirmed a synthetic `.click()` does *not* trigger it — only a real
pointer click does); compiled CSS inspected directly in `dist/index.html` to confirm the breakpoint
rule; no console errors or hydration warnings on fresh load. `npx tsc --noEmit` and `npm run build`
(incl. SSR prerender) both clean.

## Phase 3 — Structured results (the calculate/format split)

*Model: Opus, high effort — the keystone refactor. Output text must stay byte-identical while the
internals are re-plumbed; the QuoteData shape designed here is the contract Phases 5–7 build on.*

- [ ] Split `buildTape.ts`:
      - `calculate(params) → QuoteData` — pure, no `tr`, machine values: per-slot
        `{slot, kind, day, durationMin, start, end, sessions, dates?, rate, subtotal}` + totals
        `{subtotal, discount, discountKind, credit, debit, payable}` + inputs echo
        `{year, level, client, lang}`.
      - `formatTape(quote, tr) → TapeLine[]` — derives today's exact text from `QuoteData`.
- [ ] `Tape.tsx`: render rows as `<div data-field="…" data-value="…">` preserving the mono look
      (`<pre>` → styled div with `whitespace-pre-wrap font-mono`), container `id="quote"`.
- [ ] Mirror `QuoteData` into `<script type="application/json" id="quote-data">`.
- [ ] Snapshot-check: rendered text identical to current output for a few known configs.

## Phase 4 — Visible labels + form semantics

*Model: Sonnet, medium effort — small mechanical edits, but the zh label translations should be
checked by Ben (linguist) rather than trusted blind.*

- [ ] i18n: add `tr.labels` (`year`, `level`, `day`, `duration`, `credit`, `debit`, en + zh).
- [ ] Small zinc-500 uppercase `<label for>` above each select/input; `id` + `name` on controls;
      drop the now-redundant `aria-label`s.
- [ ] Wrap the input side in `<form onSubmit={e => e.preventDefault()}>` (safe because Phase 1
      set `type="button"` everywhere).

## Phase 5 — URL state

*Model: Sonnet, high effort — the encoding design and malformed-input tolerance need real thought;
the implementation itself is ordinary React state plumbing.*

- [ ] Scheme: scalars as plain params (`?year=2026&lang=zh&client=loyalty&level=vce`), active slots
      as `slots=term_1,gr_2`, per-slot config as `term_1=monday.1h.2026-01-28.2026-04-02`, holiday
      selections as `hols_1_dates=0403,0407,…` (MMDD within the known range).
- [ ] Read once on mount → seed state; write with `history.replaceState` on change (debounced).
- [ ] Ignore malformed params silently (fall back to defaults) — agents will fuzz this.

## Phase 6 — Programmatic access

*Model: Sonnet, low effort (Haiku viable) — pure wiring of the Phase-3 function; nothing to design.*

- [ ] `window.tutorterm = { calculate, version: BUILD_HASH }` exposing the Phase-3 pure function.
- [ ] Optional: Netlify Function `/api/quote?year=…` importing the same module (decide when needed —
      the JSON mirror + window API may be enough).

## Phase 7 — Verification & regression lock

*Model: Sonnet, medium effort for writing the Playwright/axe tests; the mechanical runs (Lighthouse,
driving the deployed site to eyeball results) can go to Haiku subagents per the browser-automation
delegation rule.*

- [ ] `npx lighthouse https://tutorterm-calculator.netlify.app --view` — expect a11y high-90s/100.
- [ ] Playwright smoke test (`@playwright/test` already in devDeps, needs a config): drive the UI
      via accessible names only, assert `#quote-data` JSON for 2–3 known configs, run axe.
- [ ] Reinstate badges only if generated from the real run (or leave them off).
