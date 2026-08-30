import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Reads the same structured mirror an agent would (see Phase 3 / llms.txt) rather than
// scraping rendered text, so these assertions track the real contract, not incidental markup.
async function getQuoteData(page: Page) {
  return page.evaluate(() => {
    const el = document.getElementById("quote-data");
    return el ? JSON.parse(el.textContent ?? "null") : null;
  });
}

test.describe("known quotes (driven via accessible names only)", () => {
  test("T1 CLASS, defaults (grade 7-10, loyalty, Mondays, 1hr)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "T1 CLASS" }).click();

    const quote = await getQuoteData(page);
    expect(quote.slots).toHaveLength(1);
    expect(quote.slots[0].sessions).toBe(8);
    expect(quote.totals.payable).toBe(656);
  });

  test("same slot, VCE level recalculates the rate", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "T1 CLASS" }).click();
    await page.getByLabel("Student level").selectOption("vce");

    const quote = await getQuoteData(page);
    expect(quote.inputs.level).toBe("vce");
    expect(quote.totals.payable).toBe(760);
  });

  test("credit and debit adjust the payable total", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "T1 CLASS" }).click();
    await page.getByLabel("Student level").selectOption("vce");
    await page.getByLabel("Credit").fill("50");
    await page.getByLabel("Debit").fill("20");

    const quote = await getQuoteData(page);
    expect(quote.totals.subtotal).toBe(760);
    expect(quote.totals.credit).toBe(50);
    expect(quote.totals.debit).toBe(20);
    expect(quote.totals.payable).toBe(730);
  });
});

test.describe("URL state", () => {
  // Regression test for a real bug: the per-slot config used to be `.`-delimited
  // (day.dur.start.end), but the "1.5h" duration key contains a literal ".", so it
  // mis-split into 5 parts instead of 4 and silently fell back to defaults, making the
  // 90-minute duration unreachable via URL. Fixed by switching to `~` as the delimiter.
  test("a 1.5h duration slot round-trips through the URL", async ({ page }) => {
    await page.goto(
      "/?year=2026&lang=en&client=new&level=prep_6&slots=term_4&term_4=sunday~1.5h~2026-10-05~2026-12-18"
    );

    const quote = await getQuoteData(page);
    expect(quote.slots).toHaveLength(1);
    expect(quote.slots[0].durationKey).toBe("1.5h");
    expect(quote.slots[0].sessions).toBe(10);
    expect(quote.totals.payable).toBe(1275);
  });
});

test.describe("accessibility (axe)", () => {
  test("empty state has no violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("with an active slot and quote rendered, still no violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "T1 CLASS" }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
