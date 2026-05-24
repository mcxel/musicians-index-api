/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'mini-ace',
    NEXT_PUBLIC_MODULE_NAME: 'Mini Ace',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'mini-ace' }] }];
  },
};
export default nextConfig;
