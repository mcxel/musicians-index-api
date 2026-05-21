// apps/web/src/config/component-inventory.ts
// Every TMI component — where it lives and what it does.
// This is a reference doc, not executable code.

export const COMPONENT_INVENTORY = {
  
  // ── DESIGN SYSTEM ───────────────────────────────────────
  tmiDesign: [
    { name: 'TMILogo',           path: 'tmi-design/TMILogo',           desc: 'The Musician's Index wordmark' },
    { name: 'TMIBeltHeader',     path: 'tmi-design/TMIBeltHeader',      desc: 'Gold Bebas Neue belt section header + divider' },
    { name: 'TMILiveBadge',      path: 'tmi-design/TMILiveBadge',       desc: 'Red pulsing LIVE badge' },
    { name: 'TMIRankOverlay',    path: 'tmi-design/TMIRankOverlay',     desc: 'Gold rank number over artist photo' },
    { name: 'TMICountdownTimer', path: 'tmi-design/TMICountdownTimer',  desc: 'Cyan Bebas Neue countdown (HH:MM:SS:ff)' },
    { name: 'TMIStarCTA',        path: 'tmi-design/TMIStarCTA',         desc: 'Glowing star-shaped CTA button' },
    { name: 'TMIGenreHoneycomb', path: 'tmi-design/TMIGenreHoneycomb',  desc: 'Hexagonal genre cluster grid' },
    { name: 'TMIGlowCard',       path: 'tmi-design/TMIGlowCard',        desc: 'Dark card with cyan neon border + glow' },
    { name: 'TMIGoldCard',       path: 'tmi-design/TMIGoldCard',        desc: 'Card with gold border + glow' },
    { name: 'TMICrownBadge',     path: 'tmi-design/TMICrownBadge',      desc: 'Pulsing gold crown winner badge' },
    { name: 'TMIAdDisclosure',   path: 'tmi-design/TMIAdDisclosure',    desc: '"Ad" / "Sponsored" label for paid content' },
    { name: 'TMILightningBolt',  path: 'tmi-design/TMILightningBolt',   desc: 'Decorative ⚡ bolt element' },
    { name: 'MagazineJumpStar',  path: 'tmi-design/MagazineJumpStar',   desc: 'Glowing star portal button → /magazine' },
  ],

  // ── HOMEPAGE ────────────────────────────────────────────
  homepage: [
    { name: 'HomeSectionRenderer',     path: 'home/HomeSectionRenderer',     desc: 'Renders 8 belt stack from composition API' },
    { name: 'BeltCover',               path: 'home/belts/BeltCover',          desc: '3x3 artist collage + crown + cypher results' },
    { name: 'BeltLiveWorld',           path: 'home/belts/BeltLiveWorld',      desc: 'Main lobby preview + lobby wall + random join' },
    { name: 'BeltEditorial',           path: 'home/belts/BeltEditorial',      desc: 'Article feature + news ticker + interviews + recaps' },
    { name: 'BeltDiscovery',           path: 'home/belts/BeltDiscovery',      desc: 'Genre hexagons + top 10 charts + weekly playlists' },
    { name: 'BeltMarketplace',         path: 'home/belts/BeltMarketplace',    desc: 'Merch + booking portal + achievements + sponsor' },
    { name: 'BeltTrends',              path: 'home/belts/BeltTrends',         desc: 'Countdown + event calendar + undiscovered + cypher' },
    { name: 'BeltAdvertiser',          path: 'home/belts/BeltAdvertiser',     desc: 'Paid advertiser belt (house ad fallback)' },
    { name: 'BeltPartyTeaser',         path: 'home/belts/BeltPartyTeaser',    desc: 'Active party lobbies + friend activity' },
    { name: 'NewsBillboardRail',       path: 'home/NewsBillboardRail',        desc: 'Numbered news headlines billboard display' },
    { name: 'HeadlineTickerBar',       path: 'home/HeadlineTickerBar',        desc: 'Scrolling breaking news ticker' },
    { name: 'SectionJumpNav',          path: 'home/SectionJumpNav',           desc: 'Quick-jump chip navigation to homepage sections' },
  ],

  // ── MAGAZINE ────────────────────────────────────────────
  magazine: [
    { name: 'MagazineEntryScene',      path: 'magazine/MagazineEntryScene',  desc: '"Welcome to The Musician's Index Magazine" hero' },
    { name: 'FeaturedPerformerCard',   path: 'magazine/FeaturedPerformerCard', desc: 'Large featured performer hero card w/ station link' },
    { name: 'NewsBillboardGrid',       path: 'magazine/NewsBillboardGrid',   desc: '2x2+ grid of numbered news stories' },
    { name: 'StoryRail',               path: 'magazine/StoryRail',           desc: 'Horizontal scrollable article/story rail' },
    { name: 'InterviewRail',           path: 'magazine/InterviewRail',       desc: 'Interview-specific card rail' },
    { name: 'TrendingRail',            path: 'magazine/TrendingRail',        desc: 'Currently trending content rail' },
    { name: 'SponsorStrip',            path: 'magazine/SponsorStrip',        desc: '"Presented by" sponsor divider strip' },
    { name: 'MagazineSectionCard',     path: 'magazine/MagazineSectionCard', desc: 'Icon + title + sub section gateway card' },
  ],

  // ── MONETIZATION ────────────────────────────────────────
  monetization: [
    { name: 'AdRenderer',              path: 'monetization/AdRenderer',      desc: 'Universal ad slot renderer (always 200, never blank)' },
    { name: 'SponsorRenderer',         path: 'monetization/SponsorRenderer', desc: 'Sponsor placement renderer' },
    { name: 'HouseAdFallback',         path: 'monetization/HouseAdFallback', desc: 'Internal promo when paid inventory empty' },
    { name: 'AdDisclosureLabel',       path: 'monetization/AdDisclosureLabel', desc: '"Ad" / "Sponsored" / "Presented by" label' },
    { name: 'SponsorBoard',            path: 'monetization/SponsorBoard',    desc: 'Sponsor wall display for stations/profiles' },
    { name: 'SponsorCoachingSticky',   path: 'monetization/SponsorCoachingSticky', desc: 'Artist coaching note tied to sponsor task' },
    { name: 'LocalSponsorCard',        path: 'monetization/LocalSponsorCard', desc: 'Local store sponsor card with promo loop info' },
    { name: 'EarningsPanel',           path: 'monetization/EarningsPanel',   desc: 'Artist earnings sidebar panel (always visible)' },
    { name: 'RevenueBreakdownCard',    path: 'monetization/RevenueBreakdownCard', desc: 'Revenue by source (sponsor/ad/contest/tips)' },
    { name: 'AdWidgetCard',            path: 'monetization/AdWidgetCard',    desc: 'Standard ad card for games/rooms/screens' },
    { name: 'AdLowerThird',            path: 'monetization/AdLowerThird',    desc: 'Lower-third sponsor overlay for live shows' },
  ],

  // ── PARTY + GAMES ────────────────────────────────────────
  partyAndGames: [
    { name: 'PartyLobbyShell',         path: 'party-lobby/PartyLobbyShell', desc: 'Full party lobby screen with video tiles' },
    { name: 'PartyLobbyMini',          path: 'party-lobby/PartyLobbyMini',  desc: 'Compact party bar for in-destination screens' },
    { name: 'GameLobbyShell',          path: 'games/GameLobbyShell',        desc: 'Pre-game lobby with player join panel' },
    { name: 'GameActiveShell',         path: 'games/GameActiveShell',       desc: 'In-progress game session screen' },
    { name: 'GameScoreBoard',          path: 'games/GameScoreBoard',        desc: 'Live scoring leaderboard' },
    { name: 'GameTimerCircle',         path: 'games/GameTimerCircle',       desc: 'Circular countdown timer' },
    { name: 'GameEndScreen',           path: 'games/GameEndScreen',         desc: 'Final results + CTA + ad slot' },
  ],

  // ── CLIPS + MEDIA ────────────────────────────────────────
  clips: [
    { name: 'ClipCard',                path: 'clips/ClipCard',              desc: 'Clip thumbnail + share/download actions' },
    { name: 'ClipPlayer',              path: 'clips/ClipPlayer',            desc: 'In-page clip video player' },
    { name: 'ClipSharePanel',          path: 'clips/ClipSharePanel',        desc: 'Share to Twitch/YouTube/Instagram/TikTok/copy link' },
    { name: 'ClipExportPanel',         path: 'clips/ClipExportPanel',       desc: 'Download + export options' },
    { name: 'ClipLibraryGrid',         path: 'clips/ClipLibraryGrid',       desc: 'Artist clip library grid view' },
  ],
} as const;
