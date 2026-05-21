/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'hot-screens',
    NEXT_PUBLIC_MODULE_NAME: 'HotScreens',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'hot-screens' }] }];
  },
};
export default nextConfig;
