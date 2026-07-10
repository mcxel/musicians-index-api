# Pass 2 TODO (Observatory Runtime + Thorough Certification)

- [x] Read and analyze `AdminObservatoryChat.ts` call path
- [x] Read and analyze `RuntimeConductorEngine.ts` call path
- [x] Read and analyze `RoomEnergyEngine.ts` client/server boundary
- [ ] Patch runtime conductor path to avoid server calling client-only state APIs
- [ ] Re-test `/api/admin/observatory-summary` (auth + unauth) for stable behavior
- [ ] Run thorough certification sweep across requested endpoint groups
- [ ] Produce PASS/FAIL matrix + remaining blockers + deployment recommendation
