# ARTIST PROFILES SPEC — BerntoutGlobal Family
## All 4 Profiles + Group System + Repo Wiring

---

## PROFILES CREATED

| Profile | Type | Handle | Label | Accent Color |
|---|---|---|---|---|
| Berntout Perductions | Production House | @berntoutperductions | BerntoutGlobal | Cyan |
| B.J. M Beat's | Producer / Artist (Jay Paul Sanchez) | @bjmbeats | Berntout Perductions | Gold |
| Big Kazhdog | Rapper / MC | @bigkazhdog | Berntout Perductions | Orange |
| Berntout | Group / Collective (Marcel Dickens, leader) | @berntout | BerntoutGlobal | Magenta |

---

## REPO PATHS

| Component | Path |
|---|---|
| Profile page shell | `apps/web/src/app/(magazine)/artists/[slug]/page.tsx` |
| Production house variant | `apps/web/src/components/tmi/profiles/ProductionHouseProfile.tsx` |
| Solo artist variant | `apps/web/src/components/tmi/profiles/SoloArtistProfile.tsx` |
| Group profile variant | `apps/web/src/components/tmi/profiles/GroupProfile.tsx` |
| Member management | `apps/web/src/components/tmi/profiles/MemberManager.tsx` |
| Member invite flow | `apps/web/src/components/tmi/profiles/MemberInvite.tsx` |
| Track list component | `apps/web/src/components/tmi/shared/TrackList.tsx` |
| Profile avatar | `apps/web/src/components/tmi/profiles/ProfileAvatar.tsx` |
| Stats row | `apps/web/src/components/tmi/profiles/ProfileStatsRow.tsx` |

---

## ROUTES

| Route | Profile |
|---|---|
| `/artists/berntout-perductions` | Berntout Perductions |
| `/artists/bj-m-beats` | B.J. M Beat's |
| `/artists/big-kazhdog` | Big Kazhdog |
| `/artists/berntout` | Berntout (Group) |

---

## GROUP PROFILE SYSTEM RULES

1. Only the group Leader (Marcel Dickens) can add/remove members
2. Max 12 members per group
3. Invite by TMI handle only
4. New member must accept invite before appearing on profile
5. Group has its own discography separate from individual member discographies
6. Group rank is calculated from combined member scores
7. Group follows = combined total, tracked separately
8. Label affiliation: Berntout Perductions

---

## PROFILE DATA SCHEMA (add to Prisma)

```prisma
model ArtistProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  slug            String   @unique
  handle          String   @unique
  displayName     String
  type            ProfileType
  accentColor     AccentColor
  bio             String?
  labelAffiliation String?
  genreTags       String[]
  avatarUrl       String?
  isVerified      Boolean  @default(false)
  memberOf        GroupMembership[]
  createdAt       DateTime @default(now())
}

model GroupProfile {
  id           String   @id @default(cuid())
  leaderId     String
  slug         String   @unique
  handle       String   @unique
  displayName  String
  labelId      String?
  maxMembers   Int      @default(12)
  visibility   GroupVisibility @default(PUBLIC)
  members      GroupMembership[]
  tracks       GroupTrack[]
  createdAt    DateTime @default(now())
}

model GroupMembership {
  id        String   @id @default(cuid())
  groupId   String
  artistId  String
  role      String   @default("Member")
  joinedAt  DateTime @default(now())
  group     GroupProfile  @relation(fields: [groupId], references: [id])
  artist    ArtistProfile @relation(fields: [artistId], references: [id])
}

enum ProfileType { SOLO_ARTIST | PRODUCER | GROUP | PRODUCTION_HOUSE | DJ }
enum AccentColor { ORANGE | CYAN | GOLD | MAGENTA }
enum GroupVisibility { PUBLIC | PRIVATE | INVITE_ONLY }
```

---

## SEED DATA (First 4 profiles)

```typescript
// tmi-platform/prisma/seed/artist-profiles.seed.ts
export const BERNTOUT_GLOBAL_PROFILES = [
  {
    slug: 'berntout-perductions',
    handle: '@berntoutperductions',
    displayName: 'Berntout Perductions',
    type: 'PRODUCTION_HOUSE',
    accentColor: 'CYAN',
    bio: 'A Berntout Perductions production. The creative and production arm of BerntoutGlobal.',
    labelAffiliation: 'BerntoutGlobal LLC',
    genreTags: ['Hip Hop', 'R&B', 'Trap', 'Soul', 'Production House'],
  },
  {
    slug: 'bj-m-beats',
    handle: '@bjmbeats',
    displayName: "B.J. M Beat's",
    type: 'PRODUCER',
    accentColor: 'GOLD',
    bio: 'Jay Paul Sanchez bringing the heat on the boards. Every beat is a conversation.',
    labelAffiliation: 'Berntout Perductions',
    genreTags: ['Hip Hop Beats', 'Trap', 'Boom Bap', 'R&B Production', 'Lo-Fi'],
  },
  {
    slug: 'big-kazhdog',
    handle: '@bigkazhdog',
    displayName: 'Big Kazhdog',
    type: 'SOLO_ARTIST',
    accentColor: 'ORANGE',
    bio: 'Heavy in the booth, heavy on the mic, heavy in the cypher. BerntoutGlobal artist.',
    labelAffiliation: 'Berntout Perductions',
    genreTags: ['Hip Hop', 'Trap', 'Battle Rap', 'Freestyle', 'Cypher'],
  },
  {
    slug: 'berntout',
    handle: '@berntout',
    displayName: 'Berntout',
    type: 'GROUP',
    accentColor: 'MAGENTA',
    bio: 'Berntout — the collective. Marcel Dickens and the BerntoutGlobal family moving as one.',
    labelAffiliation: 'BerntoutGlobal LLC',
    genreTags: ['Hip Hop', 'R&B', 'Collective', 'Multi-Genre', 'Live Performance'],
  }
];
```

---

*Artist Profiles Spec v1.0 — BerntoutGlobal LLC*
