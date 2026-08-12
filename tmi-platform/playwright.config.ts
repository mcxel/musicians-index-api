import { defineConfig } from "@playwright/test";

const env = globalThis.process?.env ?? {};
const baseURL = env.E2E_BASE_URL || "http://localhost:3000";
// Skip spinning up a local dev server when testing a remote/deployed URL
const isRemote = baseURL.startsWith("https://") || baseURL.startsWith("http://") && !baseURL.includes("localhost");

export default defineConfig({
  testDir: "./tests/e2e",
  retries: env.CI ? 2 : 0,
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: "pnpm -C apps/web dev",
          url: baseURL,
          reuseExistingServer: !env.CI,
          timeout: 120 * 1000,
        },
      }),
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});

