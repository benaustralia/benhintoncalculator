import type { Config } from "@netlify/functions";
import { calculate } from "../../src/lib/calculate.ts";
import { formatTape } from "../../src/lib/formatTape.ts";
import { decodeUrlState } from "../../src/lib/urlState.ts";
import { TRANSLATIONS } from "../../src/i18n/translations.ts";
import { YEAR_DATA } from "../../src/data/terms.ts";

/**
 * A quote over plain HTTP, no browser/JS runtime required by the caller. Takes the exact
 * same query-string encoding as the page's own URL state (see src/lib/urlState.ts and
 * /llms.txt) — reuses decodeUrlState, so it inherits the identical fuzz-tolerant parsing
 * for free: a malformed/unrecognised param falls back to its default rather than erroring.
 *
 * Example: /api/quote?year=2026&level=vce&slots=term_1&term_1=monday~1h~2026-01-28~2026-04-02
 */
export default async (req: Request) => {
  const url = new URL(req.url);
  const state = decodeUrlState(url.search);
  const data = YEAR_DATA[state.year];

  const quote = calculate({
    active: state.active,
    configs: state.configs,
    level: state.level,
    loyal: state.loyal,
    year: state.year,
    data,
    globalCredit: state.globalCredit,
    globalDebit: state.globalDebit,
    lang: state.lang,
  });
  const tape = formatTape(quote, TRANSLATIONS[quote.inputs.lang]);

  return Response.json(
    { quote, tape },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
};

export const config: Config = { path: "/api/quote" };
