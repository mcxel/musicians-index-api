# Button & Action Coverage Matrix

Tracks every clickable action on major pages to ensure simulation bots press and validate them, checking success and failure states.

| Page / Component | Action | Expected Result | Success Signal | Failure Signal (Test) |
| :--- | :--- | :--- | :--- | :--- |
| **`/store/tracks`** | `BuyTrackButton` | Fake wallet deducts, inventory adds. | `Owned` state, Toast msg. | Insufficient funds, API error. |
| **`/beats/auctions`** | `PlaceBidButton` | Bid registers, timer updates. | Current high bid updates. | Auction expired, Bid too low. |
| **`/rooms/*`** | `JoinRoomButton` | Socket connects, avatar placed in room. | Seat/List populates. | Room full, Banned. |
| **`/rooms/*`** | `CheerButton` | Animation fires, count increases. | UI flash, number goes up. | Rate limit hit (cooldown). |
| **`/rooms/*`** | `VoteButton` | Vote registered for target. | Button locks, total updates. | Voting closed. |
| **`/rooms/*`** | `TipButton` | Modal opens, confirm deducts fake $. | Animation, chat alert. | Insufficient balance. |
| **`/fan/[slug]/lobby`**| `AddFriendButton` | Request sent. | `Pending` state. | Already friends, Blocked. |
| **`/fan/[slug]/lobby`**| `MessageButton` | Chat pane opens. | Chat active. | User offline/blocked. |
| **`/admin/simulation`**| `StartScenarioBtn` | Bots seed, orchestrator begins. | "Running" status, logs stream. | Engine offline. |
| **`/admin/simulation`**| `ResetEconomyBtn` | All fake wallets = 0. | Balances cleared. | DB lock error. |
| **`/home/1`** | `PlayPreviewBtn` | Live audio/video preview starts. | Player active. | Stream offline. |

## Action Audit Findings
- **Visual Button State:** Bots must verify that buttons change to `Disabled`, `Loading`, or `Sold Out` states correctly. This is currently untested.
- **Dead Button Check:** A global clickability audit is required to ensure no buttons look clickable but have missing `onClick` handlers.
