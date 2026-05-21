/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: "xxl",
    NEXT_PUBLIC_MODULE_NAME: "BerntoutGlobal XXL",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Module-Id", value: "xxl" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};
export default nextConfig;
