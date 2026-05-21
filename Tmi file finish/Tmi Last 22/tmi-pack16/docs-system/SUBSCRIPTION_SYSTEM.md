# SUBSCRIPTION_SYSTEM.md
## Free Download, Subscription Access — All Tiers
Free $0: Watch rooms, basic profile, follow artists
Bronze $4.99/mo: Join rooms, chat, Stream & Win, basic stats
Gold $9.99/mo: Bronze + upload media, join cyphers, booking portal
Diamond $19.99/mo: Gold + premium rooms, analytics, fan clubs
Artist Pro $29.99/mo: Diamond + artist dashboard, payout access
Venue $49.99/mo: Venue provisioning, operator tools
Sponsor $99/mo: Campaign tools, ad placement, analytics
PERMANENT DIAMOND: Marcel Dickens and B.J. M Beat's — never expires, hardcoded.
Purchase flows: Web=Stripe Checkout | iOS=Apple IAP | Android=Google Play Billing
Restore: query Apple/Google on tap, match to TMI account, restore entitlement
Lapse: graceful downgrade — never delete data, allow resubscribe anytime
Copilot wires: apps/api/src/services/subscription.service.ts
