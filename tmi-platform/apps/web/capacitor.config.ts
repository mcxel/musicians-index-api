import type { CapacitorConfig } from '@capacitor/cli';

/**
 * TMI ships a full backend (auth, Prisma, Stripe, live rooms, WebRTC) that
 * cannot be statically exported. The native shell loads the live server
 * directly (server.url) instead of bundling a static `out/` build — this is
 * a real native binary for App Store/Play Store review, it just fetches
 * live content rather than embedding it offline.
 *
 * Environment selection: set CAPACITOR_ENV to "development" | "staging" |
 * "production" (defaults to "production") before running `cap sync`/`cap
 * open`, e.g. `CAPACITOR_ENV=development pnpm run mobile:sync`. This only
 * changes which URL the native shell points at — it does not change what
 * gets built into android/ or ios/.
 */
const SERVER_URLS: Record<string, string> = {
  development: 'http://10.0.2.2:3100', // Android emulator's alias for the host machine's localhost
  staging: 'https://staging.themusiciansindex.com',
  production: 'https://themusiciansindex.com',
};

const env = process.env.CAPACITOR_ENV ?? 'production';
const serverUrl = SERVER_URLS[env] ?? SERVER_URLS.production;

const config: CapacitorConfig = {
  appId: 'com.themusiciansindex.app',
  appName: "The Musician's Index",
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: env === 'development',
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
