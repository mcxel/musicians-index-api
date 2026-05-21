# WORLD_SIMULATION_SYSTEM.md
## Members Become the World — BerntoutGlobal XXL
Members are not users — they ARE the platform.
Fan joins room → audience count rises. Artist goes live → performer slot fills.
Lobby wall: sorted ASCENDING by viewers. 0 viewers = position 1 (discovery-first law).

```typescript
interface WorldPosition {
  surfaceId: string; surfaceType: 'room'|'belt'|'lobby'|'arena'|'queue'|'stage';
  slotNumber: number; userId: string; role: PopulationRole;
  joinedAt: Date; status: 'active'|'idle'|'performing'|'queued'|'watching';
}
```
Runtime owner: WorldSimulationEngine (to be created)
Copilot wires: WorldSimulationProvider → RoomInfrastructureProvider
Proof: lobby wall position 1 always = 0 viewers or lowest-viewer artist
