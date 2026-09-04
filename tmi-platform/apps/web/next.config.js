/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

const nextConfig = {
  distDir: process.env.TMI_BUILD_VERIFY_DISTDIR || '.next',
  transpilePackages: [
    "@tmi/contracts",
    "@tmi/hud-core",
    "@tmi/hud-runtime",
    "@tmi/hud-theme",
    "@tmi/hud-tmi",
    "@bernout/agent-network",
  ],
  webpack(config, { isServer, nextRuntime, dev }) {
    // Point each workspace package to its TypeScript source so Vercel can
    // resolve and transpile them without needing a pre-built dist/ directory.
    const pkgRoot = path.resolve(__dirname, "../../packages");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@tmi/contracts": path.join(pkgRoot, "contracts/src/index.ts"),
      "@tmi/hud-core": path.join(pkgRoot, "hud-core/src/index.ts"),
      "@tmi/hud-runtime": path.join(pkgRoot, "hud-runtime/src/index.ts"),
      "@tmi/hud-theme": path.join(pkgRoot, "hud-theme/src/index.ts"),
      "@tmi/hud-tmi": path.join(pkgRoot, "hud-tmi/src/index.tsx"),
      "@bernout/agent-network": path.join(__dirname, "src/stubs/bernout-agent-network.ts"),
    };

    // Fallback Node native modules for client-side Webpack bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        "util/types": false,
        util: false,
        stream: false,
        buffer: false,
        events: false,
        string_decoder: false,
      };
    }

    // Confine Watchpack strictly to the repository boundary during development.
    // This stops Watchpack from escaping to C:\ and triggering EINVAL errors on
    // locked Windows root files (DumpStack.log.tmp, hiberfil.sys, pagefile.sys, etc.).
    //
    // webpack's watchOptions.ignored schema accepts a glob string, an array of
    // glob strings, or a RegExp — NOT a function (a function value here throws
    // a hard webpack ValidationError on every cold `next dev`/`next build`,
    // found 2026-09-01 when a from-scratch dev server failed to start at all).
    // A single RegExp expresses the same "outside repo root OR inside
    // node_modules/.git/.next/Windows-system-paths" test the function did,
    // tested case-insensitively so Windows drive-letter casing never matters.
    if (dev || process.env.NODE_ENV === 'development') {
      const repoRoot = path.resolve(__dirname, "../..");
      const escapedRoot = repoRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: new RegExp(
          `^(?!${escapedRoot})|[\\\\/]node_modules([\\\\/]|$)|[\\\\/]\\.git([\\\\/]|$)|[\\\\/]\\.next([\\\\/]|$)|system volume information|\\$recycle\\.bin|\\.tmp$`,
          "i",
        ),
      };
    }

    // Hub shells (FanShell/PerformerShell → CommandCenterShell) are large async
    // chunks. Cold `next dev` compile can exceed webpack's default ~120s
    // chunkLoadTimeout and surface "Loading chunk … failed (timeout)".
    config.output = {
      ...(config.output || {}),
      chunkLoadTimeout: 300000,
    };

    return config;
  },
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  staticPageGenerationTimeout: 600,
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https: wss:",
      "media-src 'self' blob: https:",
      "frame-src 'self' https:",
      "worker-src 'self' blob:",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), payment=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ── www → apex canonical ──────────────────────────────────────────────
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.themusiciansindex.com' }],
        destination: 'https://themusiciansindex.com/:path*',
        permanent: true,
      },
      // ── Root → Home 1 ─────────────────────────────────────────────────────
      { source: '/', destination: '/home/1', permanent: false },

      // ── Battles ───────────────────────────────────────────────────────────
      { source: '/battles/new', destination: '/battles/create', permanent: false },
      { source: '/battles/hall-of-fame', destination: '/winner-hall', permanent: false },
      { source: '/battles/weekly-cypher', destination: '/cypher/stage', permanent: false },
      { source: '/battles/b1', destination: '/battles', permanent: false },

      // ── Artist profile aliases ─────────────────────────────────────────────
      { source: '/artist/:slug', destination: '/artists/:slug', permanent: false },
      { source: '/artist/upload', destination: '/beats/submit', permanent: false },
      { source: '/artist/nfts/mint', destination: '/nft-lab/mint', permanent: false },
      { source: '/artist/tmi/store', destination: '/store', permanent: false },

      // ── Rooms: legacy /rooms/live/[x] → /live/rooms/[x] ─────────────────
      { source: '/rooms/live/:room', destination: '/live/rooms/:room', permanent: false },
      { source: '/rooms/live', destination: '/live/lobby', permanent: false },
      { source: '/live/world', destination: '/home/3', permanent: false },
      { source: '/live/arena/:id', destination: '/live/rooms/:id', permanent: false },

      // ── Lobbies ───────────────────────────────────────────────────────────
      { source: '/lobbies/live-world', destination: '/live/lobby', permanent: false },
      { source: '/lobbies/monday-cypher', destination: '/cypher/stage', permanent: false },
      { source: '/lobbies/:slug', destination: '/live/lobby', permanent: false },

      // ── Magazine ──────────────────────────────────────────────────────────
      { source: '/magazine/1', destination: '/magazine/issue/1', permanent: false },
      { source: '/magazine/auto', destination: '/magazine', permanent: false },

      // ── Articles aliases ──────────────────────────────────────────────────
      { source: '/articles/artist/:slug', destination: '/artist-articles/:slug', permanent: false },
      { source: '/articles/sponsor/:slug', destination: '/profile/sponsor/:slug', permanent: false },
      { source: '/articles/c/:cat', destination: '/magazine', permanent: false },

      // ── Billboard/campaigns aliases ────────────────────────────────────────
      { source: '/billboards/crown-weekly', destination: '/billboard', permanent: false },
      { source: '/billboards/game-night', destination: '/games', permanent: false },
      { source: '/campaigns/summer-tour-2026', destination: '/campaigns/season-1-grand-finale', permanent: false },

      // ── Shop/season-pass aliases ──────────────────────────────────────────
      { source: '/shop/season-pass', destination: '/season-pass', permanent: false },

      // ── Fan / social ──────────────────────────────────────────────────────
      { source: '/fan/challenges', destination: '/challenges', permanent: false },
      { source: '/groups/:slug', destination: '/social/feed', permanent: false },
      { source: '/discover/:page', destination: '/home/:page', permanent: false },

      // ── Auth aliases ──────────────────────────────────────────────────────
      { source: '/signin', destination: '/auth', permanent: false },
      { source: '/login', destination: '/auth', permanent: false },

      // ── Account legacy aliases to existing settings surfaces ──────────────
      { source: '/account/notifications', destination: '/settings/notifications', permanent: false },
      { source: '/account/invites', destination: '/invite', permanent: false },
      { source: '/account/deactivate', destination: '/settings/account', permanent: false },
      { source: '/account/promos', destination: '/promo/TMI', permanent: false },

      // ── Editorial / judge / support aliases ───────────────────────────────
      // Writer Hub "NEW DRAFT" — real article submit, not /submit (tracks/beats).
      { source: '/editorial/write', destination: '/writers/submit', permanent: false },
      { source: '/editorial/drafts', destination: '/writers/dashboard', permanent: false },
      { source: '/editorial/analytics', destination: '/editorial/performance', permanent: false },
      { source: '/editorial/contributors', destination: '/writers', permanent: false },
      { source: '/admin/certification', destination: '/admin/runtime-check', permanent: false },
      { source: '/judge', destination: '/battles', permanent: false },
      { source: '/messages/support', destination: '/support', permanent: false },
      { source: '/events/:id', destination: '/live/rooms/:id', permanent: false },

      // ── Promoter hub ─────────────────────────────────────────────────────
      { source: '/promoter/events', destination: '/hub/promoter', permanent: false },

      // ── Challenges ────────────────────────────────────────────────────────
      { source: '/challenges/submit', destination: '/challenges/create', permanent: false },

      // ── Canonical PREVIEW VENUE (kill parallel /live/venue-preview path) ───
      { source: '/live/venue-preview', destination: '/venue/preview', permanent: false },
      {
        source: '/live/venue-preview/:venueId',
        destination: '/venue/preview?skin=:venueId',
        permanent: false,
      },

      // ── Favicon ───────────────────────────────────────────────────────────
      { source: '/favicon.ico', destination: '/icon.svg', permanent: false },
    ];
  },
};

module.exports = nextConfig;
