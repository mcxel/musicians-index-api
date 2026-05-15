/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  transpilePackages: [
    "@tmi/contracts",
    "@tmi/hud-core",
    "@tmi/hud-runtime",
    "@tmi/hud-theme",
    "@tmi/hud-tmi",
  ],
  webpack(config) {
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
    return config;
  },
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home/1",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
