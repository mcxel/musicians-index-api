/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'thunderworld',
    NEXT_PUBLIC_MODULE_NAME: 'Thunder World',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'thunderworld' }] }];
  },
};
export default nextConfig;
