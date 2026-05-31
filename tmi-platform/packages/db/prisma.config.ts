import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  migrate: {
    connectionString: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? '',
  },
});
