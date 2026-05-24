/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  env: {
    NEXT_PUBLIC_MODULE_ID: "law",
    NEXT_PUBLIC_MODULE_NAME: "Danika's Law",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Module-Id", value: "law" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
