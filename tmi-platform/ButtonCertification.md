# Button Certification — 2026-06-21

Targeted sweep of `<button>` elements with no `onClick` at all, across the highest-traffic component directories. Not exhaustive across every route — prioritized by user-facing impact. Buttons wrapped in a working `<Link>` or `<form onSubmit>` are correctly excluded (not dead).

## Confirmed dead buttons (18)

| File | Line | Label | Likely Intended Action |
|---|---|---|---|
| `components/profile/ArtistHeroPanel.tsx` | 28 | Follow | Toggle follow status on artist |
| `components/profile/ArtistHeroPanel.tsx` | 29 | Go Live | Route to go-live setup flow |
| `components/profile/ArtistHeroPanel.tsx` | 30 | Upload Link | Open media link upload modal |
| `components/profile/ArtistHeroPanel.tsx` | 31 | Book | Route to booking panel |
| `components/profile/ArtistArticleRail.tsx` | 10 | See All → | Route to artist's full articles page |
| `components/profile/ArtistBookingPanel.tsx` | 18 | Request Booking | Submit booking request |
| `components/profile/ArtistMediaLockerPanel.tsx` | 15 | + Add Music Link | Open music source approval modal |
| `components/profile/ArtistMediaLockerPanel.tsx` | 16 | + Add Video Link | Open video source approval modal |
| `components/lobby/RandomJoinGatewayCard.tsx` | 11 | Join Now | Matchmake into a random open room |
| `components/lobby/RandomJoinGatewayCard.tsx` | 15-18 | Hip Hop / R&B / Producer Lab / Battle | Genre filter before random join |
| `components/lobby/ArtistOpportunityPanel.tsx` | 14 | Discover Now | Route to undiscovered artist profile |
| `components/lobby/LobbyWallPanel.tsx` | 26 | See All Live Rooms → | Route to expanded room list |
| `components/economy/BeatCard.tsx` | 24-25 | $X MP3 / $X WAV | Open licensing checkout modal |
| `components/economy/TipJarWidget.tsx` | 12-17 | Tip amounts + Custom | Initialize Stripe tip flow |
| `components/economy/WalletPanel.tsx` | 26 | Request Payout (min $20) | Trigger payout request |
| `components/feed/ActivityFeedPanel.tsx` | 10 | ↻ | Refresh activity feed |
| `components/feed/ActivityFeedPanel.tsx` | 15 | Load Earlier | Pagination |
| `components/operator/GlobalCommandCenterShell.tsx` | 24-28 | Emergency Broadcast / Enable Read-Only / Override Crown / Run Diagnostics / Execute Patch (5 buttons) | Admin-only critical actions |
| `components/operator/RecoveryActionsPanel.tsx` | 10-15 | Reset Stuck Queue / Force Close Preview / Release Turn Lock / Restore Room Scene / Reassign Host / Emergency Room Close (6 buttons) | Admin recovery triggers |
| `components/producer/BeatCastPanel.tsx` | 12 | Stop Cast | Stop active beat playback |
| `components/producer/BeatPreviewPanel.tsx` | 16-18 | Pause / Loop / Swap Beat (3 buttons) | Beat playback controls |
| `components/preview/PreviewSourcePicker.tsx` | 15 | + Add Approved Source | Open media approval flow |

## Already fixed this session (not re-listed, confirmed resolved)
`OmniPresenceEngine.tsx`'s "GO LIVE NOW" and 3 destination buttons — fixed and pushed (commit `c38dd7ff`).

## Impact clusters, ranked
1. **Artist profile hero actions** (Follow/Go Live/Upload Link/Book) — blocks the core "do something with this performer" journey on every artist profile.
2. **Lobby entry gateway** (Join Now + genre filters) — blocks room discovery/entry, a core retention loop.
3. **Monetization** (beat checkout, tip jar, payout) — these are revenue-critical; a dead tip button directly costs money.
4. **Admin operator buttons** (11 total) — internal-only, lower user-facing urgency, but block real incident response if Marcel or staff ever need them.

## Recommendation
Fix in the order above. Profile hero + lobby gateway first (user-facing core loops), monetization second (revenue), admin operator last (internal, not blocking launch).
