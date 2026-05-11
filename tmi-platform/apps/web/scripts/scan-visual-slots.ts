/**
 * scripts/scan-visual-slots.ts
 *
 * Scan codebase for all public visual rendering locations that need
 * authority-aware wrapping before Phase 2.5 enforcement.
 *
 * Run: pnpm exec tsx scripts/scan-visual-slots.ts
 */

import fs from 'fs';
import path from 'path';

interface VisualSlot {
  category: string;
  location: string;
  component: string;
  filePath: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
}

const visualSlots: VisualSlot[] = [
  // Magazine visuals
  {
    category: 'MAGAZINE',
    location: 'MagazineLayout.tsx',
    component: 'PageRenderer',
    filePath: 'src/components/tmi/magazine/MagazineLayout.tsx',
    description: 'Magazine cover, article hero images, sponsor inserts',
    priority: 'P0',
  },
  {
    category: 'MAGAZINE',
    location: 'MagazineCover.tsx',
    component: 'MagazineCover',
    filePath: 'src/components/MagazineCover.tsx',
    description: 'Magazine issue cover tiles with publication metadata',
    priority: 'P0',
  },

  // Performer/Artist portraits
  {
    category: 'PORTRAIT',
    location: 'PerformerCard',
    component: 'PerformerHUD',
    filePath: 'src/components/performer/PerformerCard.tsx',
    description: 'Live performer portrait, motion portrait, avatar animation',
    priority: 'P0',
  },
  {
    category: 'PORTRAIT',
    location: 'ArtistProfile',
    component: 'ArtistHeader',
    filePath: 'src/components/artist/ArtistProfile.tsx',
    description: 'Artist profile hero, background, avatar display',
    priority: 'P0',
  },

  // Sponsor/Billboard visuals
  {
    category: 'SPONSOR',
    location: 'SponsorTile.tsx',
    component: 'SponsorTile',
    filePath: 'src/components/sponsor/SponsorTile.tsx',
    description: 'Sponsor logo, badge, billboard rendering',
    priority: 'P0',
  },
  {
    category: 'SPONSOR',
    location: 'SponsorBoard.jsx',
    component: 'SponsorBoard',
    filePath: 'src/components/tmi/sponsor/SponsorBoard.jsx',
    description: 'Sponsor tier layout with crown zone, patches, strips',
    priority: 'P0',
  },
  {
    category: 'SPONSOR',
    location: 'SponsorBelt.tsx',
    component: 'SponsorBelt',
    filePath: 'src/components/home/belts/SponsorBelt.tsx',
    description: 'Homepage sponsor carousel, billboard grid',
    priority: 'P0',
  },

  // Venue/Room visuals
  {
    category: 'VENUE',
    location: 'DigitalVenueTwinShell.tsx',
    component: 'DigitalVenueTwinShell',
    filePath: 'src/components/venue/DigitalVenueTwinShell.tsx',
    description: 'Venue 3D reconstruction, environment theme rendering',
    priority: 'P0',
  },
  {
    category: 'VENUE',
    location: 'VenueCard.tsx',
    component: 'VenueCard',
    filePath: 'src/components/venue/VenueCard.tsx',
    description: 'Venue thumbnail, stage preview, seating visualization',
    priority: 'P1',
  },

  // Ticket visuals
  {
    category: 'TICKET',
    location: 'TicketDisplay.tsx',
    component: 'TicketDisplay',
    filePath: 'src/components/tickets/TicketDisplay.tsx',
    description: 'Ticket preview, barcode, seat visualization',
    priority: 'P1',
  },
  {
    category: 'TICKET',
    location: 'NFTTicketPreview.tsx',
    component: 'NFTTicketPreview',
    filePath: 'src/components/nft/NFTTicketPreview.tsx',
    description: 'NFT ticket visual, blockchain token art, rarity display',
    priority: 'P1',
  },

  // Article/News visuals
  {
    category: 'ARTICLE',
    location: 'ArticlesHub.jsx',
    component: 'ArticlesHub',
    filePath: 'src/components/tmi/articles/ArticlesHub.jsx',
    description: 'Article card mosaic, hero images, thumbnail grid',
    priority: 'P1',
  },
  {
    category: 'ARTICLE',
    location: 'NewsStrip.tsx',
    component: 'NewsStrip',
    filePath: 'src/components/home/NewsStrip.tsx',
    description: 'News ticker images, article preview carousel',
    priority: 'P1',
  },

  // Game show visuals
  {
    category: 'GAME',
    location: 'DealOrFeud.jsx',
    component: 'DealOrFeud',
    filePath: 'src/components/tmi/shared/DealOrFeud.jsx',
    description: 'Game stage visuals, deal zone, feud board, audience wall',
    priority: 'P1',
  },

  // Homepage belt components
  {
    category: 'HOMEPAGE',
    location: 'HomepageCanvas.tsx',
    component: 'HomepageCanvas',
    filePath: 'src/components/home/HomepageCanvas.tsx',
    description: 'Magazine carousel, featured artist, trending, live shows, top 10',
    priority: 'P0',
  },
  {
    category: 'HOMEPAGE',
    location: 'FeaturedArtist.tsx',
    component: 'FeaturedArtist',
    filePath: 'src/components/home/belts/FeaturedArtist.tsx',
    description: 'Featured artist hero image, backdrop, metadata',
    priority: 'P0',
  },
  {
    category: 'HOMEPAGE',
    location: 'NewReleases.tsx',
    component: 'NewReleases',
    filePath: 'src/components/home/belts/NewReleases.tsx',
    description: 'Album art tiles, release cover grid',
    priority: 'P1',
  },

  // Fan dashboard visuals
  {
    category: 'FAN_DASHBOARD',
    location: 'FanDashboard.tsx',
    component: 'FanDashboard',
    filePath: 'src/components/fan/FanDashboard.tsx',
    description: 'Fan profile avatar, ticket collection, reward badges',
    priority: 'P1',
  },
];

function generateReport(): string {
  let report = '# Visual Slots Requiring Authority Enforcement\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Total Slots:** ${visualSlots.length}\n\n`;

  // Group by category
  const byCategory = visualSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.category]) acc[slot.category] = [];
      acc[slot.category].push(slot);
      return acc;
    },
    {} as Record<string, VisualSlot[]>
  );

  // Sort categories by priority
  const categoryOrder = ['MAGAZINE', 'SPONSOR', 'HOMEPAGE', 'VENUE', 'PORTRAIT', 'ARTICLE', 'TICKET', 'GAME', 'FAN_DASHBOARD'];

  for (const category of categoryOrder) {
    const slots = byCategory[category] || [];
    if (slots.length === 0) continue;

    report += `## ${category}\n`;
    report += `**Count:** ${slots.length} slots\n\n`;

    for (const slot of slots) {
      report += `### ${slot.location}\n`;
      report += `- **Component:** \`${slot.component}\`\n`;
      report += `- **File:** \`${slot.filePath}\`\n`;
      report += `- **Description:** ${slot.description}\n`;
      report += `- **Priority:** ${slot.priority}\n`;
      report += `- **Authority Domain:** \`${getCategoryDomain(category)}\`\n`;
      report += `- **Wrapper Function:** \`${getWrapperFunction(category)}\`\n\n`;
    }
  }

  report += '## Authority Mapping\n\n';
  report += '| Category | Domain | Wrapper Function |\n';
  report += '|----------|--------|------------------|\n';
  for (const category of Object.keys(byCategory).sort()) {
    report += `| ${category} | \`${getCategoryDomain(category)}\` | \`${getWrapperFunction(category)}\` |\n`;
  }

  report += '\n## Enforcement Checklist\n\n';
  for (const slot of visualSlots.sort((a, b) => (a.priority === 'P0' ? -1 : 1))) {
    report += `- [ ] Wrap \`${slot.component}\` in \`${getWrapperFunction(slot.category)}\`\n`;
  }

  return report;
}

function getCategoryDomain(category: string): string {
  const domains: Record<string, string> = {
    MAGAZINE: 'image-generation-control',
    SPONSOR: 'image-generation-control',
    HOMEPAGE: 'image-generation-control',
    VENUE: 'visual-hydration-control',
    PORTRAIT: 'motion-portrait-authority',
    ARTICLE: 'image-generation-control',
    TICKET: 'visual-hydration-control',
    GAME: 'visual-hydration-control',
    FAN_DASHBOARD: 'image-generation-control',
  };
  return domains[category] || 'visual-hydration-control';
}

function getWrapperFunction(category: string): string {
  const wrappers: Record<string, string> = {
    MAGAZINE: 'resolveMagazineSlotWithAuthority()',
    SPONSOR: 'resolveMagazineSlotWithAuthority()',
    HOMEPAGE: 'hydrateImageWithAuthority()',
    VENUE: 'reconstructVenueWithAuthority()',
    PORTRAIT: 'resolvePerformerPortraitWithAuthority()',
    ARTICLE: 'hydrateImageWithAuthority()',
    TICKET: 'hydrateImageWithAuthority()',
    GAME: 'hydrateImageWithAuthority()',
    FAN_DASHBOARD: 'hydrateImageWithAuthority()',
  };
  return wrappers[category] || 'routeVisualReplacementWithAuthority()';
}

// Main execution
const report = generateReport();
console.log(report);

// Write to file
const reportPath = path.join(process.cwd(), 'VISUAL_SLOTS_AUDIT.md');
fs.writeFileSync(reportPath, report, 'utf-8');
console.log(`\n✅ Report written to ${reportPath}`);
