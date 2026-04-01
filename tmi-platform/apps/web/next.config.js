/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@tmi/contracts",
    "@tmi/hud-core",
    "@tmi/hud-runtime",
    "@tmi/hud-theme",
    "@tmi/hud-tmi",
  ],
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
