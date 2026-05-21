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
    });

    // Next.js 14 expects pages-manifest.json even for App Router-only projects.
    // Emit an empty one so the post-compilation data-collection phase doesn't throw ENOENT.
    if (isServer && nextRuntime === "nodejs") {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap("EnsurePagesManifest", (stats) => {
            if (stats.compilation.errors.length) return;
            // pages-manifest.json
            const manifestPath = path.join(compiler.outputPath, "pages-manifest.json");
            const manifestDir = path.dirname(manifestPath);
            if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
            // Always write {} — this project has no Pages Router pages.
            fs.writeFileSync(manifestPath, JSON.stringify({}));
            // _document.js — App-Router-only apps have no pages/ directory but Next.js
            // build workers still attempt to load /_document during "Collecting page data".
            // Emitting a minimal stub prevents the unhandled PageNotFoundError on Node ≥22.
            const docDir = path.join(compiler.outputPath, "pages");
            const docPath = path.join(docDir, "_document.js");
            if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
            if (!fs.existsSync(docPath)) {
              fs.writeFileSync(docPath, [
                '"use strict";',
                'Object.defineProperty(exports, "__esModule", { value: true });',
                'exports.default = function Document() { return null; };',
                'exports.default.getInitialProps = undefined;',
              ].join("\n"));
            }
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
      // www → apex canonical (301 permanent — consolidates all link authority)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.themusiciansindex.com' }],
        destination: 'https://themusiciansindex.com/:path*',
        permanent: true,
      },
      {
        source: "/",
        destination: "/home/1",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
