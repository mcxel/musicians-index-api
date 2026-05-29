// packages/agent-network/src/BusinessRegistry.ts
// All BernoutGlobal ventures — agents get assigned here, not hard-coded to one app.

export type BusinessStatus = 'LIVE' | 'BETA' | 'PLANNING' | 'OFFLINE';

export interface BusinessEntity {
  id: string;
  name: string;
  status: BusinessStatus;
  url?: string;
  description: string;
}

const BUSINESSES: BusinessEntity[] = [
  {
    id: 'bernoutglobal',
    name: 'BernoutGlobal LLC',
    status: 'LIVE',
    url: 'bernoutglobal.com',
    description: 'Parent company — all ventures report here',
  },
  {
    id: 'tmi',
    name: "The Musician's Index",
    status: 'BETA',
    url: 'themusiciansindex.com',
    description: 'Music performance & sponsorship platform',
  },
  {
    id: 'thunderworld',
    name: 'Thunder World',
    status: 'PLANNING',
    description: 'Entertainment platform',
  },
  {
    id: 'robo-mechanics',
    name: 'Robo Mechanics',
    status: 'PLANNING',
    description: 'Robotics platform',
  },
];

export const BusinessRegistry = {
  getAll(): BusinessEntity[] {
    return BUSINESSES;
  },

  get(id: string): BusinessEntity | undefined {
    return BUSINESSES.find((b) => b.id === id);
  },

  getByStatus(status: BusinessStatus): BusinessEntity[] {
    return BUSINESSES.filter((b) => b.status === status);
  },
};
