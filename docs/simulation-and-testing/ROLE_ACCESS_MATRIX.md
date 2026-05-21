# Role Access Matrix

Validates that each role can perform its intended actions and is explicitly blocked from unauthorized actions.

| Role | Core Capabilities | Blocked Actions | Simulation Coverage |
| :--- | :--- | :--- | :---: |
| **Fan** | Buy tracks/props, vote, tip, join audience, cheer/boo, buy pass. | Upload beats, start battles, sell merch, access admin, ad buys. | ❌ |
| **Performer** | Enter cyphers/battles, receive tips, host rooms, post updates. | Upload beats (unless producer combo), access admin/sponsor controls. | ❌ |
| **Producer** | Upload/sell beats, start auctions, host beat battles. | Admin controls, enter vocal-only cyphers (unless combo role). | ❌ |
| **DJ** | Control room audio, mix tracks, host events, change visual scenes. | Buy ad slots, access system admin. | ❌ |
| **Host** | Moderate room, kick users, change scenes, pin messages. | System admin, platform-wide bans. | ❌ |
| **Sponsor/Advertiser** | Buy ad slots, place banners, gift prizes, view campaign analytics. | Perform, moderate rooms, alter platform content. | ❌ |
| **Admin (Big Ace)** | Override rankings, ban users, reset economy, force issue sprint. | N/A (Superuser) | ❌ |
| **Simulation Bot** | Act as any role above with fake currency/data ONLY. | Touch real Stripe flows, overwrite real sponsor contracts. | ❌ |

## Audit Findings
- **Role Permissions Enforced?** Currently implemented at route level, but deep component-level disabling (e.g., hidden buttons for fans on producer pages) needs audit.
- **Bot Boundary:** CRITICAL. The boundary preventing bot actions from triggering real money or real user notifications must be formalized.
