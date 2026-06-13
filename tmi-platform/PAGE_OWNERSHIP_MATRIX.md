# TMI PAGE OWNERSHIP MATRIX
**Status:** LOCKED - PROTOCOL 5.0

This document dictates the sole purpose of each homepage. If a component does not match the channel's identity, it must be removed or relocated.

| Channel | Identity | Primary Purpose | Key Data Source | Fallback CTA |
|---|---|---|---|---|
| **HOME 1** | The Cover | First Impression, Crown & Discovery | `CrownGovernor`, `OrbitalEngine` | "Join the Arena" |
| **HOME 1-2** | Billboard | Ranking & Truth (Top 100, Charts) | `BillboardEngine`, `RankGovernor` | "Get Ranked" |
| **HOME 2** | The Magazine | Editorial, News, Interviews & Features | `CMS` / `ArticleAPI` | "Write for TMI" |
| **HOME 3** | Live World | Energy, Streams & Broadcast Walls | `BroadcastEngine`, `WebRTC` | "Go Live" |
| **HOME 4** | Marketplace | Revenue, Ads, Sponsors, Booking | `AdManager`, `Stripe Ledger` | "Advertise Here" |
| **HOME 5** | The Arena | Competition (Battles, Cyphers, Games) | `BattleGovernor` | "Start Battle" |

### Global Layer Rules
- **Ad Priority Stack:** Internal Inventory > Premium Sponsor > AdSense > "Advertise Here" CTA. *No empty slots.*
- **Fallback Chain:** WebRTC Stream > Motion Asset > Profile Video > Profile Image > Genre Default. *Never render a black box.*
- **Data Binding:** Every module must connect to a Database/API route. No hardcoded seed data in production.

### Navigation Law
Every button, tile, chevron, and card MUST click to a real, certified destination. Dead ends (`href="#"`) fail deployment.