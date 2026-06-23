# Role Convergence Audit (Locked)

## Build Director Lock

This audit locks two platform rules:

1. Role Authority Matrix is the source of truth for ownership and access.
2. Utility Over Decoration is mandatory across all HQs, profiles, rails, and dashboards.

## Universal Policy

- No relationship = no person.
- Every relationship surface must use real IDs and real destinations.
- If no valid relationship exists, show an honest empty state plus add action.

## Canonical Reference Files

- Role matrix: apps/web/src/lib/auth/RoleAuthorityMatrix.ts
- Utility policy: apps/web/src/lib/governance/UtilityRealityPolicy.ts
- Shared relationship renderer: apps/web/src/components/social/FriendsList.tsx

## Role HQ Targets

- Fan HQ: discovery, support, social, participation tools only.
- Performer HQ: creation, performance, monetization tools only.
- Venue HQ: event hosting and ticket inventory authority only.
- Promoter HQ: campaign and outreach tools only.
- Writer HQ: editorial publishing tools only.
- Producer HQ: beat and collaboration tools only.
- Advertiser HQ: ad campaign and analytics tools only.
- Sponsor HQ: sponsorship and rewards tools only.
- Admin HQ: moderation, review, and governance tools only.

## Surface Audit Targets (Initial)

Relationship renders to audit and enforce:

- apps/web/src/components/social/FriendsList.tsx
- apps/web/src/components/fan/FanSocialRail.tsx
- apps/web/src/app/hub/fan/page.tsx
- apps/web/src/components/fan/FanDashboard.tsx
- apps/web/src/components/social/ProfileSocialSection.tsx

Additional high-risk surfaces discovered for follow-up:

- apps/web/src/components/profiles/TMIProfileShell.tsx
- apps/web/src/components/home/data/getHomeCharts.ts
- apps/web/src/components/TrendingArtists.tsx
- apps/web/src/components/homepage/density/useHomeDensityData.ts
- apps/web/src/components/discovery/DiscoverySidePanel.tsx

## Acceptance Criteria

If relationship exists:

- show account
- show image
- show route

If relationship does not exist:

- show honest empty state
- show explicit add or invite action

Never show:

- seeded names
- demo users
- placeholder friends
- fake performers
- unknown identities

## Utility Audit Checklist

For every visible button, panel, widget, card, face, profile section, rail, ranking, and dashboard item:

1. What does it do?
2. Where does it route?
3. Who owns it?
4. Is it real?
5. What happens if clicked?
6. What happens if empty?

If no meaningful answer exists: remove, replace, or wire.
