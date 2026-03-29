import type {
  IssueBuildInput,
  MagazineBrainState,
  PageRef,
  RecentPageEntry,
} from './types';
import { buildIssueSequence } from './IssueEngine';
import { getRecentPages, recordRecentPage } from './RecentMemory';

export interface MagazineBrain {
  getState: () => MagazineBrainState;
  nextPage: () => PageRef | null;
  recordVisit: (page: Omit<RecentPageEntry, 'visitedAt'>) => void;
  getRecent: () => RecentPageEntry[];
}

export function createMagazineBrain(input: IssueBuildInput): MagazineBrain {
  const built = buildIssueSequence(input);

  let state: MagazineBrainState = {
    sequence: built.sequence,
    cursor: 0,
    recentPages: [],
    randomHistory: built.randomHistory,
  };

  return {
    getState: () => state,
    nextPage: () => {
      const entry = state.sequence[state.cursor];
      if (!entry) return null;
      state = { ...state, cursor: state.cursor + 1 };
      return entry.page;
    },
    recordVisit: (page) => {
      state = {
        ...state,
        recentPages: recordRecentPage(state.recentPages, page),
      };
    },
    getRecent: () => getRecentPages(state.recentPages),
  };
}
