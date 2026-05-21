# Top 10 / Crown / Magazine Propagation Map

Maps the lifecycle of an artist reaching #1 and the subsequent editorial propagation across the platform.

## The Propagation Chain

1. **Vote Aggregation:** 
   - Source: Rooms, Battles, Cyphers, Profile tips.
   - Action: Votes tabulated by `top10-ranking.engine`.
2. **Top 10 Update:** 
   - Source: Chart System.
   - Action: Platform leaderboards update.
3. **Crown Assignment (#1):** 
   - Source: Chart System.
   - Action: Top artist receives `Crown` status. Notification dispatched.
4. **Article / Home Hero Promotion:** 
   - Source: Editorial Engine.
   - Action: #1 artist promoted to Homepage rails (`/home/1`..`5`) and featured Article card.
5. **Magazine Issue Placement:** 
   - Source: Magazine System.
   - Action: Artist placed on the cover/feature of the current or next issue.
6. **Retention Hold (3 Months):** 
   - Source: `crown-retention.engine`.
   - Action: Protects the magazine feature slot for exactly 3 months (simulated in 12x time).
7. **Decay / Replacement:** 
   - Source: Chart System / Editorial Engine.
   - Action: After 3 months, or if overtaken heavily in dynamic charts, artist is gracefully demoted. Fallback logic runs to populate the empty slot.

## Audit Findings
- **Hold Logic:** The 3-month retention logic needs a rigid fast-forward testing capability.
- **Collision:** What happens if a new #1 emerges during a 3-month hold? Does the old #1 stay on the magazine while the new #1 gets the homepage? Rule clarification needed in code.
