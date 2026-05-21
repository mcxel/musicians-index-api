#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const targets = [
  'src/components/ads/AdSlotRotator.tsx',
  'src/components/artist/ArtistHeader.tsx',
  'src/components/billboards/TmiHoverPreviewCard.tsx',
  'src/components/cards/MediaCardShell.tsx',
  'src/components/charts/ChartStrip.tsx',
  'src/components/contest/ContestDiscoveryGrid.tsx',
  'src/components/contest/ScoreboardOverlay.tsx',
  'src/components/global/CountryArtistRail.tsx',
  'src/components/home/HomePage05LiveAdInventory.tsx',
  'src/components/home/HomePage05PlacementMarketplace.tsx',
  'src/components/home/HomePage05SponsorSpotlight.tsx',
  'src/components/home/OrbitBattleAnimationLayer.tsx',
  'src/components/home/RankStackRiseLayer.tsx',
  'src/components/hosts/HostMotionAvatar.tsx',
  'src/components/hosts/HostPortraitCard.tsx',
  'src/components/hosts/HostRosterPanel.tsx',
  'src/components/investor/InvestorPreviewSurface.tsx',
  'src/components/preview/PreviewMetadataCard.tsx',
  'src/components/preview/SharedPreviewStagePanel.tsx',
  'src/components/preview/SharedPreviewWindow.tsx',
  'src/components/ranking/Top10ReactionLayer.tsx',
  'src/components/results/WinnerCard.tsx',
  'src/components/search/SearchResultCard.tsx',
  'src/components/sponsor/SponsorContestPanel.tsx',
  'src/components/sponsor/SponsorROIAnalytics.tsx',
  'src/components/tmi/sponsor/SponsorInvitePanel.tsx',
  'src/packages/magazine-engine/ArtistArticleTemplateMixer.tsx',
  'src/packages/magazine-engine/Home1OpenSpreadOverlay.tsx',
  'src/packages/magazine-engine/Home2ArtifactSystem.tsx',
  'src/packages/magazine-engine/Home5ArtifactSystem.tsx',
  'src/packages/magazine-engine/NewsArticleGrid.tsx',
  'src/packages/magazine-engine/SponsorAdSlotGrid.tsx',
  'src/packages/motion/VerticalGenreScroller.tsx',
];

const importLine = "import { ImageSlotWrapper } from '@/components/visual-enforcement';";

let changed = 0;
for (const rel of targets) {
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) continue;
  const raw = fs.readFileSync(full, 'utf8');
  if (!raw.includes('<ImageSlotWrapper')) continue;
  if (raw.includes("from '@/components/visual-enforcement'")) continue;
  if (raw.includes("from '@/components/visual-enforcement/ImageSlotWrapper'")) continue;

  const lines = raw.split(/\r?\n/);
  let insertAt = 0;

  if (lines[0]?.startsWith("'use client'" ) || lines[0]?.startsWith('"use client"')) {
    insertAt = 1;
    if (lines[1] === '') insertAt = 2;
  }

  while (insertAt < lines.length && lines[insertAt].startsWith('import ')) {
    insertAt += 1;
  }

  lines.splice(insertAt, 0, importLine);
  const next = lines.join('\n');
  fs.writeFileSync(full, next, 'utf8');
  changed += 1;
  console.log(`patched: ${rel}`);
}

console.log(`done: patched ${changed} files`);
