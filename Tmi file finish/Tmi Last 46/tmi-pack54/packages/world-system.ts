// packages/world-system/src/world-system.ts
// Defines all 5 homepage worlds, their rules, data adapters, and cross-world persistence.

export type WorldId = "1" | "2" | "3" | "4" | "5";

export interface WorldConfig {
  id: WorldId;
  name: string;
  route: string;
  label: string;
  shortLabel: string;
  description: string;
  primaryColor: string;
  scene: string;
  audioProfile: string;
  isLiveWorld: boolean;         // shows live room content
  isMonetizationWorld: boolean; // shows ads/sponsor content
  requiresAuth: boolean;
  dataAdapters: string[];       // which adapter modules supply data
  belts: WorldBelt[];
}

export interface WorldBelt {
  id: string;
  label: string;
  refreshIntervalMs: number;   // polling interval (Law: use polling not WebSockets for homepage)
  isLiveBelt: boolean;
  fallbackDataKey: string;
}

export const WORLD_REGISTRY: Record<WorldId, WorldConfig> = {
  "1": {
    id:"1", name:"magazine_cover", route:"/", label:"Magazine Cover", shortLabel:"Magazine",
    description:"Weekly crown, genre battles, discovery-first artist grid. Who took the crown this week?",
    primaryColor:"#FFB800", scene:"magazine", audioProfile:"editorial",
    isLiveWorld:true, isMonetizationWorld:false, requiresAuth:false,
    dataAdapters:["crown.adapter","artist-grid.adapter","cypher-status.adapter"],
    belts:[
      { id:"artist_grid",     label:"Artist Grid",      refreshIntervalMs:30000,  isLiveBelt:true,  fallbackDataKey:"seed_artists" },
      { id:"crown_ticker",    label:"Crown Ticker",     refreshIntervalMs:5000,   isLiveBelt:true,  fallbackDataKey:"seed_crown"   },
      { id:"hype_bot_feed",   label:"Hype Bot Feed",    refreshIntervalMs:3000,   isLiveBelt:true,  fallbackDataKey:"seed_hype"    },
    ],
  },
  "2": {
    id:"2", name:"editorial", route:"/editorial", label:"Editorial", shortLabel:"Editorial",
    description:"Magazine dashboard: articles, discovery, marketplace.",
    primaryColor:"#00B8A9", scene:"magazine", audioProfile:"editorial",
    isLiveWorld:false, isMonetizationWorld:true, requiresAuth:false,
    dataAdapters:["articles.adapter","charts.adapter","discovery.adapter","marketplace.adapter"],
    belts:[
      { id:"editorial",    label:"Editorial Belt",          refreshIntervalMs:900000, isLiveBelt:false, fallbackDataKey:"seed_articles" },
      { id:"discovery",    label:"Discovery Belt",          refreshIntervalMs:300000, isLiveBelt:false, fallbackDataKey:"seed_genres"   },
      { id:"marketplace",  label:"Platform & Marketplace",  refreshIntervalMs:60000,  isLiveBelt:false, fallbackDataKey:"seed_store"    },
    ],
  },
  "3": {
    id:"3", name:"live_world", route:"/lobby", label:"Live World", shortLabel:"Live",
    description:"Live rooms, lobby wall (discovery-first), cypher arena, stream & win.",
    primaryColor:"#FF2D78", scene:"live-stage", audioProfile:"lobby_ambient",
    isLiveWorld:true, isMonetizationWorld:true, requiresAuth:false,
    dataAdapters:["rooms.adapter","lobby-wall.adapter","events.adapter","cypher.adapter"],
    belts:[
      { id:"live_activity", label:"Live World Activity", refreshIntervalMs:10000, isLiveBelt:true, fallbackDataKey:"seed_rooms"  },
      { id:"discovery",     label:"Discovery Trends",    refreshIntervalMs:60000, isLiveBelt:false,fallbackDataKey:"seed_events" },
    ],
  },
  "4": {
    id:"4", name:"sponsor_tool", route:"/advertise", label:"Ad Tool", shortLabel:"Ad Tool",
    description:"Sponsor/advertiser tool: campaigns, inventory, analytics, deals.",
    primaryColor:"#FFB800", scene:"sponsor-showcase", audioProfile:"sponsor_neutral",
    isLiveWorld:false, isMonetizationWorld:true, requiresAuth:true,
    dataAdapters:["campaigns.adapter","analytics.adapter","deals.adapter","inventory.adapter"],
    belts:[
      { id:"spotlight",  label:"Sponsor Spotlight",   refreshIntervalMs:60000, isLiveBelt:false, fallbackDataKey:"seed_ads"      },
      { id:"inventory",  label:"Inventory",           refreshIntervalMs:300000,isLiveBelt:false, fallbackDataKey:"seed_inventory"},
      { id:"analytics",  label:"Analytics",           refreshIntervalMs:60000, isLiveBelt:false, fallbackDataKey:"seed_analytics"},
      { id:"deals",      label:"Deals & Contracts",   refreshIntervalMs:300000,isLiveBelt:false, fallbackDataKey:"seed_deals"    },
    ],
  },
  "5": {
    id:"5", name:"advertisers_world", route:"/world", label:"Sponsors World", shortLabel:"Sponsors",
    description:"Public-facing advertisers marketplace: premium ads, inventory, analytics, partner deals.",
    primaryColor:"#00B8A9", scene:"sponsor-showcase", audioProfile:"sponsor_neutral",
    isLiveWorld:false, isMonetizationWorld:true, requiresAuth:false,
    dataAdapters:["marketplace.adapter","placements.adapter","analytics.adapter","deals.adapter"],
    belts:[
      { id:"premium_spotlight", label:"Premium Ads Spotlight",    refreshIntervalMs:60000, isLiveBelt:false, fallbackDataKey:"seed_premium_ads" },
      { id:"marketplace",       label:"Advertising Marketplace",  refreshIntervalMs:300000,isLiveBelt:false, fallbackDataKey:"seed_marketplace"  },
      { id:"inventory",         label:"Inventory & Placements",   refreshIntervalMs:300000,isLiveBelt:false, fallbackDataKey:"seed_placements"   },
      { id:"analytics",         label:"Analytics & Performance",  refreshIntervalMs:60000, isLiveBelt:false, fallbackDataKey:"seed_perf"         },
      { id:"deals",             label:"Deals & Contracts",        refreshIntervalMs:300000,isLiveBelt:false, fallbackDataKey:"seed_deals"        },
    ],
  },
};

export function getWorldConfig(id: WorldId): WorldConfig {
  return WORLD_REGISTRY[id];
}

// Update GlobalHUD WorldSwitcher to include World 5
export const WORLD_SWITCHER_ITEMS: Array<[WorldId, string, string]> = [
  ["1", "Magazine",  "/"],
  ["2", "Editorial", "/editorial"],
  ["3", "Live",      "/lobby"],
  ["4", "Ad Tool",   "/advertise"],
  ["5", "Sponsors",  "/world"],
];
