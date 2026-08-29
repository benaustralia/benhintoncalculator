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

- [x] Split `buildTape.ts` into `src/lib/calculate.ts` + `src/lib/formatTape.ts` (`buildTape.ts`
      deleted):
      - `calculate(params) → QuoteData` — pure, no `tr` reachable from the module. Per-slot
        `{slot, kind, term, day, durationKey, durationMin, start, end, sessions, dates,
        excludedHolidays, rate, subtotal, subtotalExact, groupReading}` + totals
        `{subtotal, discount, discountKind, credit, debit, payable}` + `inputs`
        `{year, level, client, lang, rate}`.
      - `formatTape(quote, tr) → TapeLine[]` — derives today's exact text from `QuoteData`.
        `TapeLine` moved here (was in `Tape.tsx`) and gained `field`/`value`.
- [x] `Tape.tsx`: rows are `<div data-field="…" data-value="…">` inside `id="quote"`
      (`<pre>` → div with `whitespace-pre-wrap font-mono`, same classes so the mono look is
      unchanged; the one blank tape line renders a literal space so its line box keeps height).
- [x] Mirror `QuoteData` into `<script type="application/json" id="quote-data">` (via
      `dangerouslySetInnerHTML` — React escapes plain script children into invalid JSON — with
      every less-than sign rewritten to its JSON unicode escape so no closing script tag can
      appear in the payload).
- [x] Snapshot-check: **1695 configs, 0 mismatches**. A throwaway harness ran the pre-refactor
      `buildTape` and `formatTape(calculate(…))` side by side over years × langs × levels ×
      loyalty × 13 active-slot sets × 4 day/duration pairs, plus credit/debit variants (incl.
      malformed `"abc"`), the `EXCLUDES` public-holiday path, narrowed date windows, zero-session
      windows, empty holiday-chip selections and the dormant per-term `groupReading` flag —
      comparing every line's `text` + `warn` and the total.

**Two deliberate behaviour deltas** (both improvements, neither visible in the tape text):
- The `aria-live` container now stays mounted when the quote is empty. Previously `Tape` returned
  `null`, so the live region was inserted at the same moment as its first content — which screen
  readers do not announce.
- `#quote-data` is always emitted, including the empty state, so an agent can read the current
  inputs before anything is selected.

**Rounding, now explicit in the contract:** the app rounds once, on the accumulated exact cost, so
a sum of per-slot `subtotal`s can differ from `totals.subtotal` by a dollar (45-minute slots at
odd rates). That was already true; `subtotalExact` is exposed so Phase 6 consumers can reconcile
rather than rediscover it. A weekly term slot's own `subtotal` excludes its `groupReading` block —
the tape prints the two combined, `calculate` keeps them separate.

**Done 2026-08-29.** `npx tsc --noEmit` clean; `npm run build` clean (SSR prerender emits the
empty-state `#quote-data`). Verified in Chrome on the `vite preview` build: selecting T2 CLASS
gives `SUBTOTAL $738` with `data-field`/`data-value` on every row (`slot-excludes` →
`2026-06-08`), the spacer row measures the same 26px as every other line, and a fresh load logs
nothing at all — no hydration warnings. eslint on the new files is clean (the pre-existing errors
in `TermCalculator.tsx` remain, untouched).

## Phase 4 — Visible labels + form semantics

*Model: Sonnet, medium effort — small mechanical edits, but the zh label translations should be
checked by Ben (linguist) rather than trusted blind.*

- [x] i18n: add `tr.labels` (`year`, `level`, `day`, `duration`, `credit`, `debit`, en + zh).
- [x] Small zinc-500 uppercase `<label for>` above each select/input; `id` + `name` on controls;
      drop the now-redundant `aria-label`s.
- [x] Wrap the input side in `<form onSubmit={e => e.preventDefault()}>` (safe because Phase 1
      set `type="button"` everywhere).

**Done 2026-08-29.** Year/Student level selects and Credit/Debit inputs labelled in `InputPanel.tsx`;
per-slot Day/Duration selects in `TermCard.tsx` labelled with ids scoped by `idPrefix={slotKey}` so
multiple active term cards don't collide on `id`. `zh` label for STUDENT LEVEL was reviewed and
changed from 年级 (literally "grade") to 阶段 ("stage/level") since the select also covers VCE and
ADULT, not just grade levels — Ben's call. `npx tsc --noEmit` and `npm run build` (incl. SSR
prerender) both clean; the two pre-existing `TermCard.tsx` eslint unused-import errors are unrelated
to this diff (confirmed present on a stash of this phase's changes). Verified in Chrome against the
`vite preview` build: toggling T1 CLASS reveals the term card with visible DAY / DURATION labels
above their selects, YEAR / STUDENT LEVEL / CREDIT / DEBIT labels render on load, and the quote
still calculates ($656 for T1 CLASS Mondays 1hr).

## Phase 5 — URL state

*Model: Sonnet, high effort — the encoding design and malformed-input tolerance need real thought;
the implementation itself is ordinary React state plumbing.*

- [x] Scheme: scalars as plain params (`?year=2026&lang=zh&client=loyalty&level=vce`), active slots
      as `slots=term_1,gr_2`, per-slot config as `term_1=monday.1h.2026-01-28.2026-04-02`, holiday
      selections as `hols_1_dates=0403,0407,…` (MMDD within the known range).
- [x] Read once on mount → seed state; write with `history.replaceState` on change (debounced).
- [x] Ignore malformed params silently (fall back to defaults) — agents will fuzz this.

**Implementation (`src/lib/urlState.ts`):** `decodeUrlState`/`encodeUrlState`, field-by-field
fallback rather than all-or-nothing per slot — an invalid `day` token doesn't drop a valid `dur` in
the same param. Every active slot always gets a complete, safe `CardConfig` synthesized from the
same defaults `toggle()` uses (Monday/1h non-GR, Sunday/1.5h GR, Sundays pre-seeded for GR-hols),
then overridden field-by-field by whatever in the URL validates. Start/end must be well-formed ISO,
`start <= end`, and both inside the slot's natural date range, or the pair is rejected together (no
partial start-without-end). Holiday `_dates` tokens are matched by `MMdd` against that slot's actual
computed date list (safe — no slot's range spans a full year, so month+day never repeats), then
filtered against `publicHolidays` the same way the UI disables PH chips — so a malformed or
PH-disabled token is silently dropped rather than smuggled into a slot the UI itself won't allow.
Unknown slot keys in `slots=` are dropped entirely (never reach `calculate`).

`TermCalculator`: one mount-only effect calls `decodeUrlState(window.location.search)` and seeds all
eight pieces of state (SSR always renders the plain defaults, so there's no hydration mismatch to
reconcile — this only ever pulls state forward, same pattern as `useIsDesktop`); a second effect
debounces (300ms) `encodeUrlState(...)` back into `history.replaceState`, always writing the full
scalar state (year/lang/client/level) even at defaults so a URL is a complete, self-describing
snapshot for an agent — not just a diff from unstated defaults.

**Done 2026-08-29.** `npx tsc --noEmit` and `npm run build` (incl. SSR prerender) both clean; eslint
on the new/changed files shows only the three pre-existing `TermCalculator.tsx` errors (confirmed
identical via `git stash`), nothing new. Verified in Chrome on the `vite preview` build: a URL with
`lang=zh&client=new&level=vce&slots=term_1,gr_hols_2,bogus_slot` plus a `gr_hols_2_dates` list
containing one malformed token (`9999`) hydrated correctly — `zh-CN` `lang`, VCE rate, `term_1`'s
day/dur/start/end from its param, `gr_hols_2`'s valid dates kept and the malformed one dropped,
`bogus_slot` silently ignored (absent from state and from the rewritten URL). A second fuzz pass
(`year=1999&level=bogus&client=xyz` + swapped/out-of-range `term_1` dates) fell back to defaults on
every field with no console errors. A real click on T1 CLASS produced the $656 quote from earlier
phases and the URL updated to `slots=term_1&term_1=monday.1h.2026-01-28.2026-04-02` after the
debounce. Pushed to `main` (`d59f44b`).

## Phase 6 — Programmatic access

*Model: Sonnet, low effort (Haiku viable) — pure wiring of the Phase-3 function; nothing to design.*

- [x] `window.tutorterm = { calculate, version: BUILD_HASH }` exposing the Phase-3 pure function.
- [x] `window.tutorterm.formatTape(quote)` — added same day, post-review: `calculate` alone only
      gets a JS-capable caller the structured `QuoteData`; the human-readable tape text (what "Copy
      quote" copies) needed `formatTape` exposed too, so a headless caller (no page render, no click)
      can get the exact printed lines in one round trip.
- [ ] Optional: Netlify Function `/api/quote?year=…` importing the same module (decide when needed —
      the JSON mirror + window API may be enough).

**Implementation:** wired directly in `src/main.tsx` (the client-only entry — `entry-server.tsx` never
imports it, so SSR never touches `window`), not inside `TermCalculator`, so `window.tutorterm` exists
immediately when the script runs rather than waiting on a post-hydration effect. `BUILD_HASH` was
already computed inline in `InputPanel.tsx`'s footer (`VITE_COMMIT_REF` ‖ `VITE_GIT_COMMIT_SHA`,
truncated to 7 chars); factored that one-liner out to `src/lib/version.ts` (`getBuildHash()`) so the
footer and `window.tutorterm.version` can't drift — both now read the literal same string. The global
`Window.tutorterm` type lives in `vite-env.d.ts` next to the existing `__COMMIT_HASH__` ambient decl.

**Netlify Function deferred, not skipped:** `window.tutorterm.calculate` plus the `#quote-data` JSON
mirror (Phase 3) already cover "can an agent get a structured quote without clicking through the UI"
for anything that can run a browser or a headless page. A `/api/quote` endpoint only earns its keep
for a caller with *no* JS runtime (a pure HTTP client) — not asked for, and speculative infra for a
scenario nobody's hit yet is exactly the kind of thing not to build ahead of need. Revisit if that
caller shows up.

**`formatTape` wiring:** exposed as `quote => formatTape(quote, TRANSLATIONS[quote.inputs.lang])` —
resolves the `Translations` object from the quote's own `inputs.lang` internally, so a headless
caller never needs to know `TRANSLATIONS`/`Translations` exist; it just chains `calculate()` then
`formatTape()` on the result. Type added to `Window.tutorterm` in `vite-env.d.ts` alongside `calculate`.

**Done 2026-08-29.** `npx tsc --noEmit`, eslint, and `npm run build` (incl. SSR prerender) all clean.
Verified in Chrome on the `vite preview` build: `window.tutorterm` exposes exactly `{calculate,
formatTape, version}` (nothing else leaked onto it); calling `calculate()` standalone with a
hand-built `CalculateParams` (T1 CLASS, Mondays, 1hr, grade 7-10, loyalty) returned the same `$656`
/ 8 sessions as the UI; `window.tutorterm.version` matched the footer's commit hash exactly,
confirming the single-source-of-truth refactor. Then, on a fresh load with **zero** clicks and
**zero** URL params, chained `calculate()` → `formatTape()` in both `en` and `zh` and got back the
exact tape text the "Copy quote" button would copy (`SUBTOTAL $656` / `小计 $656` etc.) — confirming
a fully headless round trip: load the page, call two functions, get the tape. No console errors on
load. Pushed to `main` (`30812d2`).

## Phase 7 — Verification & regression lock

*Model: Sonnet, medium effort for writing the Playwright/axe tests; the mechanical runs (Lighthouse,
driving the deployed site to eyeball results) can go to Haiku subagents per the browser-automation
delegation rule.*

- [ ] `npx lighthouse https://tutorterm-calculator.netlify.app --view` — expect a11y high-90s/100.
- [ ] Playwright smoke test (`@playwright/test` already in devDeps, needs a config): drive the UI
      via accessible names only, assert `#quote-data` JSON for 2–3 known configs, run axe.
- [ ] Reinstate badges only if generated from the real run (or leave them off).
