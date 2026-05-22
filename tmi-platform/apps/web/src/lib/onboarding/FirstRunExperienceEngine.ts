/**
 * FirstRunExperienceEngine
 * Determines what a new user should see/do on first visit.
 * Reads from localStorage; no server calls required.
 */

export type UserRole = 'fan' | 'artist' | 'performer' | 'venue' | 'sponsor' | 'advertiser';

export type FirstRunStep = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  xpGrant: number;
  role: UserRole | 'all';
};

const STORAGE_KEY = 'tmi_first_run_v1';

const ALL_STEPS: FirstRunStep[] = [
  {
    id: 'complete-profile',
    title: 'Complete Your Profile',
    description: 'Add a photo, bio, and social links so fans and collaborators can find you.',
    ctaLabel: 'Set Up Profile',
    ctaHref: '/account',
    xpGrant: 50,
    role: 'all',
  },
  {
    id: 'explore-home',
    title: 'Explore the Magazine',
    description: 'Browse live rooms, battles, and the latest news from the music world.',
    ctaLabel: 'Go to Home',
    ctaHref: '/home/1',
    xpGrant: 10,
    role: 'all',
  },
  {
    id: 'fan-first-vote',
    title: 'Cast Your First Vote',
    description: 'Vote in an active battle and earn your first XP points.',
    ctaLabel: 'Enter a Battle',
    ctaHref: '/battles',
    xpGrant: 25,
    role: 'fan',
  },
  {
    id: 'fan-join-live',
    title: 'Join a Live Room',
    description: 'Watch artists perform live and send your first tip or shoutout.',
    ctaLabel: 'Find Live Rooms',
    ctaHref: '/live/lobby',
    xpGrant: 15,
    role: 'fan',
  },
  {
    id: 'artist-upload-beat',
    title: 'Upload Your First Beat',
    description: 'List a beat on the marketplace and start earning.',
    ctaLabel: 'Go to Marketplace',
    ctaHref: '/marketplace',
    xpGrant: 75,
    role: 'artist',
  },
  {
    id: 'artist-enter-battle',
    title: 'Enter Your First Battle',
    description: 'Submit a track to an active challenge and build your rep.',
    ctaLabel: 'Enter a Challenge',
    ctaHref: '/challenges',
    xpGrant: 50,
    role: 'artist',
  },
  {
    id: 'performer-go-live',
    title: 'Start a Live Room',
    description: 'Host your first performance and start earning tips from fans.',
    ctaLabel: 'Go Live',
    ctaHref: '/cypher/live',
    xpGrant: 100,
    role: 'performer',
  },
  {
    id: 'venue-list-event',
    title: 'List Your First Event',
    description: 'Add your venue and post an upcoming event for ticket sales.',
    ctaLabel: 'List Event',
    ctaHref: '/onboarding/venue',
    xpGrant: 75,
    role: 'venue',
  },
  {
    id: 'sponsor-create-patronage',
    title: 'Sponsor an Artist',
    description: 'Start a patronage for $25/mo and get your logo in their orbit.',
    ctaLabel: 'Find Artists',
    ctaHref: '/artists/dashboard',
    xpGrant: 0,
    role: 'sponsor',
  },
  {
    id: 'advertiser-place-ad',
    title: 'Place Your First Ad',
    description: 'Book an ad placement starting at $0.99/day to reach music fans.',
    ctaLabel: 'View Ad Placements',
    ctaHref: '/advertiser/placements',
    xpGrant: 0,
    role: 'advertiser',
  },
];

export type FirstRunState = {
  completedSteps: string[];
  dismissed: boolean;
  role: UserRole | null;
  startedAt: number;
};

function loadState(): FirstRunState {
  if (typeof window === 'undefined') {
    return { completedSteps: [], dismissed: false, role: null, startedAt: Date.now() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FirstRunState;
  } catch {
    // corrupt storage
  }
  return { completedSteps: [], dismissed: false, role: null, startedAt: Date.now() };
}

function saveState(state: FirstRunState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getFirstRunState(): FirstRunState {
  return loadState();
}

export function setFirstRunRole(role: UserRole): void {
  const state = loadState();
  saveState({ ...state, role });
}

export function completeFirstRunStep(stepId: string): number {
  const state = loadState();
  if (state.completedSteps.includes(stepId)) return 0;
  const step = ALL_STEPS.find((s) => s.id === stepId);
  const xp = step?.xpGrant ?? 0;
  saveState({ ...state, completedSteps: [...state.completedSteps, stepId] });
  return xp;
}

export function dismissFirstRun(): void {
  const state = loadState();
  saveState({ ...state, dismissed: true });
}

export function getActiveStepsForRole(role: UserRole): FirstRunStep[] {
  return ALL_STEPS.filter((s) => s.role === 'all' || s.role === role);
}

export function getPendingSteps(role: UserRole): FirstRunStep[] {
  const state = loadState();
  return getActiveStepsForRole(role).filter((s) => !state.completedSteps.includes(s.id));
}

export function isFirstRunComplete(role: UserRole): boolean {
  return getPendingSteps(role).length === 0;
}

export function totalXPGranted(role: UserRole): number {
  return getActiveStepsForRole(role).reduce((sum, s) => sum + s.xpGrant, 0);
}
