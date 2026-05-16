/**
 * Host Show Assignment Engine
 * Maps each TMI show to its full host lineup.
 */

export interface ShowHostAssignment {
  showId: string;
  mainHostId: string;
  coHostIds: string[];
  judgeIds: string[];
  prizeHostId?: string;
  paAnnouncerId?: string;
}

export const SHOW_HOST_ASSIGNMENTS: Record<string, ShowHostAssignment> = {
  'monthly-idol': {
    showId: 'monthly-idol',
    mainHostId: 'gregory-marcel',
    coHostIds: ['mindy-jean-long'],
    judgeIds: ['jack-obrien', 'hector-lvanos'],
    prizeHostId: 'mindy-jean-long',
    paAnnouncerId: 'aura-pa',
  },

  'monday-night-stage': {
    showId: 'monday-night-stage',
    mainHostId: 'bobby-stanley',
    coHostIds: ['kira', 'bebo'],
    judgeIds: [],
    paAnnouncerId: 'aura-pa',
  },

  'deal-or-feud': {
    showId: 'deal-or-feud',
    mainHostId: 'gregory-marcel',
    coHostIds: ['mindy-jean-long'],
    judgeIds: [],
    prizeHostId: 'mindy-jean-long',
    paAnnouncerId: 'aura-pa',
  },

  'name-that-tune': {
    showId: 'name-that-tune',
    mainHostId: 'record-ralph',
    coHostIds: ['kira'],
    judgeIds: ['hector-lvanos'],
    paAnnouncerId: 'aura-pa',
  },

  'circle-squares': {
    showId: 'circle-squares',
    mainHostId: 'bobby-stanley',
    coHostIds: ['julius'],
    judgeIds: [],
    paAnnouncerId: 'aura-pa',
  },

  'cypher-arena': {
    showId: 'cypher-arena',
    mainHostId: 'nova-mc',
    coHostIds: ['julius'],
    judgeIds: ['jack-obrien', 'hector-lvanos'],
    paAnnouncerId: 'aura-pa',
  },
};

export function getShowHosts(showId: string): ShowHostAssignment | undefined {
  return SHOW_HOST_ASSIGNMENTS[showId];
}
