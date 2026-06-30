# SSR Runtime Stabilization TODO

- [x] Patch shared boundary `apps/web/src/components/live/ArenaEventShell.tsx` to move client-only runtime behind one SSR-safe dynamic boundary
- [ ] Keep all `/app/rooms/*` route pages unchanged for now
- [x] Run `pnpm -C apps/web typecheck`
- [ ] Run `pnpm -C apps/web build` (currently fails on `/live/audience` and `/rooms/rehearsal`)
- [x] Review build output for prior failing routes and chunk chain (`615427 -> 20491 -> 713242`) — still reproducing on chunk `48291` (`713242 -> 20491`)
