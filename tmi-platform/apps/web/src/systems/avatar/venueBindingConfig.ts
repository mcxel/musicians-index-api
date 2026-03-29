// ============================================================
// AVATAR VENUE BINDING CONFIG
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarVenueZone, AvatarRole, AvatarPoseState } from './types';

export interface VenueZoneDefinition {
  id: AvatarVenueZone;
  label: string;
  capacity: number;
  allowedRoles: AvatarRole[];
  defaultPose: AvatarPoseState;
  facingDirection: 'stage' | 'host' | 'audience' | 'camera' | 'center';
  seatGrid?: { rows: number; cols: number };
  stageProximity: 'near' | 'mid' | 'far' | 'on-stage';
  lightingZone: 'spotlight' | 'ambient' | 'dim' | 'party';
  sponsorZone: boolean;
}

export const VENUE_ZONE_REGISTRY: Record<AvatarVenueZone, VenueZoneDefinition> = {
  'audience-seat': {
    id: 'audience-seat',
    label: 'Audience Seat',
    capacity: 200,
    allowedRoles: ['fan', 'audience', 'npc'],
    defaultPose: 'watching',
    facingDirection: 'stage',
    seatGrid: { rows: 10, cols: 20 },
    stageProximity: 'mid',
    lightingZone: 'ambient',
    sponsorZone: false,
  },
  'stage-mark': {
    id: 'stage-mark',
    label: 'Stage Mark',
    capacity: 4,
    allowedRoles: ['artist', 'guest'],
    defaultPose: 'mic-hold',
    facingDirection: 'audience',
    stageProximity: 'on-stage',
    lightingZone: 'spotlight',
    sponsorZone: false,
  },
  'host-podium': {
    id: 'host-podium',
    label: 'Host Podium',
    capacity: 1,
    allowedRoles: ['host'],
    defaultPose: 'host-speaking',
    facingDirection: 'audience',
    stageProximity: 'on-stage',
    lightingZone: 'spotlight',
    sponsorZone: false,
  },
  'dj-booth': {
    id: 'dj-booth',
    label: 'DJ Booth',
    capacity: 2,
    allowedRoles: ['artist', 'guest'],
    defaultPose: 'mic-hold',
    facingDirection: 'audience',
    stageProximity: 'on-stage',
    lightingZone: 'party',
    sponsorZone: false,
  },
  'interview-chair': {
    id: 'interview-chair',
    label: 'Interview Chair',
    capacity: 2,
    allowedRoles: ['host', 'cohost', 'guest', 'artist'],
    defaultPose: 'talking',
    facingDirection: 'camera',
    stageProximity: 'near',
    lightingZone: 'spotlight',
    sponsorZone: false,
  },
  'vip-balcony': {
    id: 'vip-balcony',
    label: 'VIP Balcony',
    capacity: 20,
    allowedRoles: ['vip', 'fan'],
    defaultPose: 'watching',
    facingDirection: 'stage',
    seatGrid: { rows: 2, cols: 10 },
    stageProximity: 'far',
    lightingZone: 'ambient',
    sponsorZone: true,
  },
  'cypher-circle': {
    id: 'cypher-circle',
    label: 'Cypher Circle',
    capacity: 8,
    allowedRoles: ['artist', 'fan', 'guest'],
    defaultPose: 'idle',
    facingDirection: 'center',
    stageProximity: 'near',
    lightingZone: 'party',
    sponsorZone: false,
  },
  'backstage-zone': {
    id: 'backstage-zone',
    label: 'Backstage Zone',
    capacity: 10,
    allowedRoles: ['artist', 'host', 'cohost', 'guest'],
    defaultPose: 'idle',
    facingDirection: 'stage',
    stageProximity: 'near',
    lightingZone: 'dim',
    sponsorZone: false,
  },
  'venue-walkway': {
    id: 'venue-walkway',
    label: 'Venue Walkway',
    capacity: 30,
    allowedRoles: ['fan', 'audience', 'vip', 'npc'],
    defaultPose: 'idle',
    facingDirection: 'stage',
    stageProximity: 'far',
    lightingZone: 'ambient',
    sponsorZone: false,
  },
  'sponsor-booth': {
    id: 'sponsor-booth',
    label: 'Sponsor Booth',
    capacity: 5,
    allowedRoles: ['fan', 'audience', 'vip', 'npc'],
    defaultPose: 'watching',
    facingDirection: 'camera',
    stageProximity: 'far',
    lightingZone: 'spotlight',
    sponsorZone: true,
  },
  'contest-platform': {
    id: 'contest-platform',
    label: 'Contest Platform',
    capacity: 6,
    allowedRoles: ['artist', 'guest'],
    defaultPose: 'stage-entry',
    facingDirection: 'audience',
    stageProximity: 'on-stage',
    lightingZone: 'spotlight',
    sponsorZone: true,
  },
  'green-room': {
    id: 'green-room',
    label: 'Green Room',
    capacity: 8,
    allowedRoles: ['artist', 'host', 'cohost', 'guest'],
    defaultPose: 'idle',
    facingDirection: 'center',
    stageProximity: 'near',
    lightingZone: 'ambient',
    sponsorZone: false,
  },
  'front-row': {
    id: 'front-row',
    label: 'Front Row',
    capacity: 20,
    allowedRoles: ['fan', 'vip'],
    defaultPose: 'watching',
    facingDirection: 'stage',
    seatGrid: { rows: 1, cols: 20 },
    stageProximity: 'near',
    lightingZone: 'ambient',
    sponsorZone: false,
  },
};

export function getZoneForRole(role: AvatarRole): VenueZoneDefinition[] {
  return Object.values(VENUE_ZONE_REGISTRY).filter((z) => z.allowedRoles.includes(role));
}

export function getDefaultZoneForRole(role: AvatarRole): AvatarVenueZone {
  const defaults: Record<AvatarRole, AvatarVenueZone> = {
    host: 'host-podium',
    cohost: 'interview-chair',
    guest: 'interview-chair',
    artist: 'stage-mark',
    fan: 'audience-seat',
    vip: 'vip-balcony',
    audience: 'audience-seat',
    npc: 'audience-seat',
  };
  return defaults[role] ?? 'audience-seat';
}
