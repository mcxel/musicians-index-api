-- Add BAND to the Role enum. Documented in CLAUDE.md Rule 26's provisioning
-- matrix (multi-member performer group — Media Locker + Performer Live
-- Access, shared with PERFORMER) but was never actually added to the schema.
--
-- ALTER TYPE ... ADD VALUE cannot run inside an explicit transaction block
-- before Postgres 12; this repo targets Postgres 12+ (see the pg driver
-- adapter usage in apps/web/src/lib/prisma.ts), so this is safe as a
-- standalone statement. Placed AFTER 'PERFORMER' to match schema.prisma's
-- declared enum order.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'BAND' AFTER 'PERFORMER';
