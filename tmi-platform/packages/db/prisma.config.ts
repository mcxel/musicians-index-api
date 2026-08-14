import { defineConfig } from 'prisma/config';
import 'dotenv/config';

const dbUrl = process.env['DATABASE_URL'] ?? '';
const directUrl = process.env['DIRECT_URL'] && !process.env['DIRECT_URL'].includes('USER:PASSWORD')
  ? process.env['DIRECT_URL']
  : dbUrl;

export default defineConfig({
  datasource: {
    url: dbUrl,
    directUrl,
  },
  migrate: {
    connectionString: directUrl || dbUrl,
  },
});
