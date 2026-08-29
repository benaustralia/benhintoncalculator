import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4174",
    trace: "on-first-retry",
  },
  // Rebuilds (tsc + vite + SSR prerender) before every run so the smoke test
  // exercises current source, not a stale dist/.
  webServer: {
    command: "npm run build && npm run preview -- --port 4174",
    url: "http://localhost:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
