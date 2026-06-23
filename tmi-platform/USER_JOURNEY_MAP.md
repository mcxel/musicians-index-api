# THE INFINITY LOOP: USER JOURNEY MAP

Every user must always have a logical next action. Here is the mapped ideal state vs. current reality.

## The Fan Loop
1. **Discover:** Reads Magazine Article about Artist. *(Working)*
2. **Navigate:** Clicks to Artist Profile. *(Working)*
3. **Watch:** Sees "LIVE NOW" badge, enters Room. *(Working)*
4. **Interact:** Clicks 🔥 Hype in AudienceScene. *(Broken - does not award points)*
5. **Capture:** Saves a Memory of the show. *(Broken - no prompt to do so post-show)*
6. **Return:** Checks Leaderboard to see their fan rank. *(Partial - Leaderboards not wired to live points)*

## The Writer Loop
1. **Write:** Pitches article in Writer Dashboard. *(Broken - Dashboard doesn't exist)*
2. **Publish:** Admin approves, article goes live. *(Working via Admin Queue)*
3. **Attribute:** Readers click Writer's byline. *(Broken - Bylines are dead text)*
4. **Earn:** Writer earns XP/Rev-share based on article views. *(Broken - missing Ledger connection)*

## The Sponsor Loop
1. **Discover:** Sees available `SponsorSlot` on Home 1. *(Partial - mock data)*
2. **Purchase:** Buys slot via Stripe. *(Broken - missing payment intent)*
3. **Deploy:** Uploads `AdCreative` to Admin Queue. *(Working via Visual Queue)*
4. **Track:** Views ROI and Impressions on Sponsor Hub. *(Broken - Sponsor Hub missing)*

## Critical Closure Recommendations
1. **Fix the "End of Show" screen:** Never let a user hit a dead end when a stream ends. Always redirect them to the Artist's Profile or the Memory Wall.
2. **Make all names hyperlinks:** Every mention of an Artist, Writer, or Sponsor anywhere on the platform MUST be a `<Link>` tag. 
3. **Turn points into popups:** Every time a user interacts, a small `+10 XP` toast must float up the screen to trigger the dopamine retention loop.