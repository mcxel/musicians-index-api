export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { OnboardingMission } from '@/components/onboarding/OnboardingMissionCard';

// Role-specific mission sets. Ordered: most impactful first.
const MISSIONS_BY_ROLE: Record<string, Omit<OnboardingMission, 'id'>[]> = {
  performer: [
    { emoji: '📸', headline: 'Upload your profile photo', subtext: 'Your photo unlocks your magazine feature and appears on discovery rails.', ctaLabel: 'UPLOAD PHOTO', ctaHref: '/hub/performer?action=upload-photo', accentColor: '#FF2DAA' },
    { emoji: '🎤', headline: 'Add your artist bio', subtext: 'Tell the world who you are. Fans read this before they follow.', ctaLabel: 'WRITE BIO', ctaHref: '/hub/performer?action=edit-bio', accentColor: '#AA2DFF' },
    { emoji: '🎵', headline: 'Upload your first song', subtext: 'Your music plays in discovery rails, magazine articles, and live rooms.', ctaLabel: 'UPLOAD SONG', ctaHref: '/hub/performer?action=upload-song', accentColor: '#00FFFF' },
    { emoji: '🎧', headline: 'Create your playlist', subtext: 'Curate your best tracks into a playlist fans can follow.', ctaLabel: 'CREATE PLAYLIST', ctaHref: '/hub/performer?action=create-playlist', accentColor: '#FFD700' },
    { emoji: '📌', headline: 'Pin photos to your Memory Wall', subtext: 'Memories build your profile story. Fans love seeing behind the scenes.', ctaLabel: 'ADD MEMORY', ctaHref: '/hub/performer?action=add-memory', accentColor: '#00FF88' },
    { emoji: '🔴', headline: 'Go Live', subtext: 'Your stream can appear on the homepage, Home 3, and Lobby Wall.', ctaLabel: 'START BROADCAST', ctaHref: '/live/go', accentColor: '#FF2020' },
    { emoji: '📰', headline: 'Get featured in the Magazine', subtext: 'Every performer with a completed profile is eligible for a magazine feature.', ctaLabel: 'VIEW MAGAZINE', ctaHref: '/magazine', accentColor: '#FFD700' },
  ],
  fan: [
    { emoji: '📸', headline: 'Upload your profile photo', subtext: 'Let performers and fans recognize you in live rooms and lobbies.', ctaLabel: 'UPLOAD PHOTO', ctaHref: '/hub/fan?action=upload-photo', accentColor: '#00FFFF' },
    { emoji: '🎤', headline: 'Follow your first performer', subtext: 'Get notified when they go live and get early access to their music.', ctaLabel: 'DISCOVER ARTISTS', ctaHref: '/performers', accentColor: '#FF2DAA' },
    { emoji: '🎧', headline: 'Join a live room', subtext: 'Sit in the audience, react, tip, and make yourself heard.', ctaLabel: 'FIND LIVE ROOMS', ctaHref: '/home/3', accentColor: '#AA2DFF' },
    { emoji: '💰', headline: 'Send your first tip', subtext: 'Support a performer live. It appears in chat and boosts their energy.', ctaLabel: 'SEE LIVE ROOMS', ctaHref: '/home/3', accentColor: '#FFD700' },
    { emoji: '📰', headline: 'Read the Magazine', subtext: 'Discover new artists, read features, and explore the TMI world.', ctaLabel: 'OPEN MAGAZINE', ctaHref: '/magazine', accentColor: '#00FF88' },
  ],
  venue: [
    { emoji: '🏛️', headline: 'Complete your venue profile', subtext: 'A complete profile gets your venue on the discovery map.', ctaLabel: 'EDIT PROFILE', ctaHref: '/hub/venue?action=edit-profile', accentColor: '#FF2DAA' },
    { emoji: '🎫', headline: 'Create your first event', subtext: 'List an upcoming show to start selling tickets.', ctaLabel: 'CREATE EVENT', ctaHref: '/venues/events/new', accentColor: '#FFD700' },
    { emoji: '🔴', headline: 'Host a live stream', subtext: 'Broadcast your venue to fans worldwide — no ticket required.', ctaLabel: 'GO LIVE', ctaHref: '/live/go', accentColor: '#FF2020' },
  ],
  sponsor: [
    { emoji: '🏢', headline: 'Complete your brand profile', subtext: 'Your brand appears on sponsor rails across every TMI surface.', ctaLabel: 'EDIT PROFILE', ctaHref: '/hub/sponsor?action=edit-profile', accentColor: '#AA2DFF' },
    { emoji: '⭐', headline: 'Sponsor your first performer', subtext: 'Get your brand in front of their audience across profile, live room, and magazine.', ctaLabel: 'FIND PERFORMERS', ctaHref: '/performers', accentColor: '#FFD700' },
  ],
  advertiser: [
    { emoji: '📺', headline: 'Set up your first ad campaign', subtext: 'Reach live audiences across Home pages, articles, and discovery rails.', ctaLabel: 'CREATE CAMPAIGN', ctaHref: '/hub/advertiser?action=new-campaign', accentColor: '#00FFFF' },
  ],
};

function addIds(missions: Omit<OnboardingMission, 'id'>[], role: string): OnboardingMission[] {
  return missions.map((m, i) => ({ ...m, id: `${role}_${i}` }));
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  const role  = (req.cookies.get('tmi_role')?.value ?? 'fan').toLowerCase();

  let completedIds: string[] = [];

  if (email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, displayName: true, image: true },
      }).catch(() => null);

      if (user) {
        const hasSong     = (await prisma.song.count({ where: { uploaderId: user.id } }).catch(() => 0)) > 0;
        const hasPlaylist = (await prisma.playlist.count({ where: { creatorId: user.id } }).catch(() => 0)) > 0;

        const rawMissions = MISSIONS_BY_ROLE[role] ?? MISSIONS_BY_ROLE.fan ?? [];
        addIds(rawMissions, role).forEach(m => {
          if (m.id === `${role}_0` && user.image)  completedIds.push(m.id); // photo
          if (m.id === `${role}_2` && hasSong)      completedIds.push(m.id); // song
          if (m.id === `${role}_3` && hasPlaylist)  completedIds.push(m.id); // playlist
        });
      }
    } catch {
      // DB unavailable — surface all missions
    }
  }

  const rawMissions = MISSIONS_BY_ROLE[role] ?? MISSIONS_BY_ROLE.fan ?? [];
  const all = addIds(rawMissions, role);
  const pending = all.filter(m => !completedIds.includes(m.id));

  return NextResponse.json({ pending, total: all.length, completedCount: completedIds.length });
}
