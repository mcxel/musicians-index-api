# TMI DB Package (Prisma)

## Setup
1) Copy env file:
- Create `packages/db/.env` from `.env.example`
- Set `DATABASE_URL`

## Generate Prisma Client
```bash
cd packages/db
pnpm exec prisma generate
```

## Migrate (Dev)
```bash
cd packages/db
pnpm exec prisma migrate dev -n add_refunds
```

## Seed (optional)
```bash
cd packages/db
pnpm exec prisma db seed
```

Notes

migrate dev requires a working database.

CI should NOT run migrate dev unless you provision a test database.

### `tmi-platform/packages/db/prisma/seed.ts`
```ts
/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Minimal seed scaffold – safe to run multiple times.
  // Add real seed data once core models are finalized.
  console.log("Seeding: start");

  // Example placeholder:
  // await prisma.user.upsert({ ... })

  console.log("Seeding: done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add this `prisma.seed` entry to `packages/db/package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

If `ts-node` is not already a dev dependency of `packages/db`, add it:

```bash
pnpm -C packages/db add -D ts-node typescript
```
