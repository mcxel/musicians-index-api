/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'willdoit',
    NEXT_PUBLIC_MODULE_NAME: 'WillDoIt',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'willdoit' }] }];
  },
};
export default nextConfig;
