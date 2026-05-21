/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MODULE_ID: 'usa-stream-team',
    NEXT_PUBLIC_MODULE_NAME: 'USA Stream Team',
  },
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Module-Id', value: 'usa-stream-team' }] }];
  },
};
export default nextConfig;
