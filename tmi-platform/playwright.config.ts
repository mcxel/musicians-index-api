import { defineConfig } from "@playwright/test";

const env = globalThis.process?.env ?? {};
const baseURL = env.E2E_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  retries: env.CI ? 2 : 0,
  webServer: {
    command: "pnpm -C apps/web dev",
    url: baseURL,
    reuseExistingServer: !env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
});
