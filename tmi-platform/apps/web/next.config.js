/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

const nextConfig = {
  transpilePackages: [
    "@tmi/contracts",
    "@tmi/hud-core",
    "@tmi/hud-runtime",
    "@tmi/hud-theme",
    "@tmi/hud-tmi",
    "@bernout/agent-network",
  ],
  webpack(config, { isServer, nextRuntime }) {
    // Point each workspace package to its TypeScript source so Vercel can
    // resolve and transpile them without needing a pre-built dist/ directory.
    const pkgRoot = path.resolve(__dirname, "../../packages");
    Object.assign(config.resolve.alias, {
      "@tmi/contracts": path.join(pkgRoot, "contracts/src/index.ts"),
      "@tmi/hud-core": path.join(pkgRoot, "hud-core/src/index.ts"),
      "@tmi/hud-runtime": path.join(pkgRoot, "hud-runtime/src/index.ts"),
      "@tmi/hud-theme": path.join(pkgRoot, "hud-theme/src/index.ts"),
      "@tmi/hud-tmi": path.join(pkgRoot, "hud-tmi/src/index.tsx"),
      "@bernout/agent-network": path.join(__dirname, "src/stubs/bernout-agent-network.ts"),
    });

    // Add watchOptions to ignore noisy system files on Windows during `next dev`
    // This prevents "EINVAL" errors from files like pagefile.sys or System Volume Information.
    if (!isServer) {
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: "**/{DumpStack.log.tmp,System Volume Information,hiberfil.sys,pagefile.sys,swapfile.sys}",
      };
    }

    // Ensure pages-manifest and minimal pages fallbacks are present for mixed app/pages setups.
    if (isServer && nextRuntime === "nodejs") {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap("EnsurePagesManifest", (stats) => {
            if (stats.compilation.errors.length) return;

            const manifestPath = path.join(compiler.outputPath, "pages-manifest.json");
            const manifestDir = path.dirname(manifestPath);
            if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });

            const manifest = fs.existsSync(manifestPath)
              ? JSON.parse(fs.readFileSync(manifestPath, "utf8") || "{}")
              : {};

            const pagesDir = path.join(compiler.outputPath, "pages");
            if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

            const ensureStub = (name, lines) => {
              const p = path.join(pagesDir, name);
              if (!fs.existsSync(p)) fs.writeFileSync(p, lines.join("\n"));
            };

            ensureStub("_document.js", [
              '"use strict";',
              'Object.defineProperty(exports, "__esModule", { value: true });',
              "const React = require('react');",
              "function Document() { return React.createElement(React.Fragment, null); }",
              "module.exports = Document;",
              "module.exports.default = Document;",
            ]);

            ensureStub("_error.js", [
              '"use strict";',
              'Object.defineProperty(exports, "__esModule", { value: true });',
              "const React = require('react');",
              "function ErrorPage(){ return React.createElement('div', null, 'Error'); }",
              "ErrorPage.getInitialProps = function(){ return { statusCode: 500 }; };",
              "module.exports = ErrorPage;",
              "module.exports.default = ErrorPage;",
            ]);

            manifest["/_document"] = "pages/_document.js";
            manifest["/_error"] = "pages/_error.js";
            fs.writeFileSync(manifestPath, JSON.stringify(manifest));
          });
        },
      });
    }

    return config;
  },
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  staticPageGenerationTimeout: 300,
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
      { source: '/magazine/article/:slug', destination: '/magazine/article/:slug', permanent: false },

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
      { source: '/editorial/write', destination: '/submit', permanent: false },
      { source: '/judge', destination: '/battles', permanent: false },
      { source: '/messages/support', destination: '/support', permanent: false },
      { source: '/events/:id', destination: '/live/rooms/:id', permanent: false },

      // ── Promoter hub ─────────────────────────────────────────────────────
      { source: '/promoter/events', destination: '/hub/promoter', permanent: false },

      // ── Challenges ────────────────────────────────────────────────────────
      { source: '/challenges/submit', destination: '/challenges/create', permanent: false },
    ];
  },
};

module.exports = nextConfig;
