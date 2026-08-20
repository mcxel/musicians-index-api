import { defineConfig } from "@playwright/test";

const env = globalThis.process?.env ?? {};
const baseURL = env.E2E_BASE_URL || "http://127.0.0.1:3000";
// Skip spinning up a local dev server when testing a remote/deployed URL
const isRemote = baseURL.startsWith("https://") || (baseURL.startsWith("http://") && !baseURL.includes("127.0.0.1") && !baseURL.includes("localhost"));

export default defineConfig({
  testDir: "./tests",
  timeout: 120 * 1000,        // room page SSR (ensureHydrated + heavy imports) can be slow
  retries: env.CI ? 2 : 0,
  ...(isRemote
    ? {}
    : {
        webServer: {
          // Pin hostname + port so the server never drifts to 3001/3002
          command: "pnpm -C apps/web dev --hostname 127.0.0.1 --port 3000",
          url: "http://127.0.0.1:3000",
          reuseExistingServer: !env.CI,
          timeout: 120 * 1000,
        },
      }),
  use: {
    baseURL,
    navigationTimeout: 60 * 1000,  // individual page.goto timeout
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});

