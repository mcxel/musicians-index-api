/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'need-a-charge',
    NEXT_PUBLIC_MODULE_NAME: 'Need-A-Charge',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'need-a-charge' }] }];
  },
};
export default nextConfig;
