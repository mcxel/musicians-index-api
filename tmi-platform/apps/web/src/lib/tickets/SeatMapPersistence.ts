/**
 * Persistent venue seat-map config (floor / balcony / VIP / pricing zones).
 *
 * DB authority via ensure* runtime DDL (same pattern as DigitalTicketPersistence /
 * ArtistCommerceCatalog) so Vercel cold starts and multi-instance keep edits.
 * In-process memory is a hot cache only — not the source of truth.
 */

import prisma from "@/lib/prisma";
import {
  venueSeatMapEngine,
  type VenueSeatMap,
  type SeatSection,
  type SeatTier,
  type SeatStatus,
} from "@/lib/tickets/VenueSeatMapEngine";

export type SeatPricingZone = {
  id: string;
  label: string;
  tier: SeatTier;
  capacity: number;
  priceCents: number;
  color: string;
};

export type PersistedSeatMapConfig = {
  venueId: string;
  /** Empty string = venue-default map; set for per-event overrides. */
  eventId: string;
  venueName: string;
  seatMapId: string;
  zones: SeatPricingZone[];
  layout: VenueSeatMap;
  updatedAt: string;
};

type SeatMapRow = {
  id: string;
  venueId: string;
  eventId: string;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type SeatMapPayload = {
  venueName: string;
  seatMapId: string;
  zones: SeatPricingZone[];
  layout: VenueSeatMap;
};

const memory = new Map<string, PersistedSeatMapConfig>();

let schemaReady: Promise<void> | null = null;

function mapKey(venueId: string, eventId?: string | null): string {
  return `${venueId.trim()}::${(eventId ?? "").trim()}`;
}

function rowId(venueId: string, eventId?: string | null): string {
  const e = (eventId ?? "").trim();
  return e ? `seatmap-${venueId.trim()}-${e}` : `seatmap-${venueId.trim()}`;
}

/** Idempotent DDL — safe on every cold start. */
export async function ensureVenueSeatMapSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VenueSeatMap" (
          id TEXT PRIMARY KEY,
          "venueId" TEXT NOT NULL,
          "eventId" TEXT NOT NULL DEFAULT '',
          payload JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "VenueSeatMap_venueId_eventId_key" UNIQUE ("venueId", "eventId")
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "VenueSeatMap_venueId_idx"
          ON "VenueSeatMap"("venueId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "VenueSeatMap_eventId_idx"
          ON "VenueSeatMap"("eventId");
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function defaultZones(venueId: string): SeatPricingZone[] {
  return [
    { id: `${venueId}-floor`, label: "Floor", tier: "general", capacity: 180, priceCents: 9000, color: "#22d3ee" },
    { id: `${venueId}-balcony`, label: "Balcony", tier: "general", capacity: 240, priceCents: 5500, color: "#a855f7" },
    { id: `${venueId}-vip`, label: "VIP", tier: "vip", capacity: 48, priceCents: 18000, color: "#f59e0b" },
  ];
}

function layoutFromZones(venueId: string, venueName: string, zones: SeatPricingZone[]): VenueSeatMap {
  const sections: SeatSection[] = zones.map((z, zi) => {
    const seats = Array.from({ length: Math.min(z.capacity, 400) }, (_, i) => ({
      id: `${z.id}-${i + 1}`,
      row: String.fromCharCode(65 + (i % 12)),
      number: (i % 20) + 1,
      section: z.id,
      tier: z.tier,
      status: "available" as SeatStatus,
      price: z.priceCents / 100,
      isAccessible: i % 40 === 0,
      x: 0.1 + (i % 20) * 0.04,
      y: 0.15 + zi * 0.25 + Math.floor(i / 20) * 0.05,
    }));
    return {
      id: z.id,
      label: z.label,
      tier: z.tier,
      color: z.color,
      seats,
    };
  });

  const totalCapacity = zones.reduce((a, z) => a + z.capacity, 0);
  return {
    venueId,
    venueName,
    totalCapacity,
    sections,
    stageX: 0.3,
    stageY: 0.02,
    stageWidth: 0.4,
    stageHeight: 0.08,
  };
}

function buildDefaultConfig(venueId: string, eventId: string, venueName?: string): PersistedSeatMapConfig {
  const name = venueName ?? venueId;
  const zones = defaultZones(venueId);
  const layout = layoutFromZones(venueId, name, zones);
  return {
    venueId,
    eventId,
    venueName: name,
    seatMapId: rowId(venueId, eventId),
    zones,
    layout,
    updatedAt: new Date().toISOString(),
  };
}

function mapRow(row: SeatMapRow): PersistedSeatMapConfig {
  const payload = row.payload as SeatMapPayload;
  return {
    venueId: row.venueId,
    eventId: row.eventId ?? "",
    venueName: payload.venueName,
    seatMapId: payload.seatMapId,
    zones: payload.zones,
    layout: payload.layout,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPayload(config: PersistedSeatMapConfig): SeatMapPayload {
  return {
    venueName: config.venueName,
    seatMapId: config.seatMapId,
    zones: config.zones,
    layout: config.layout,
  };
}

function cacheConfig(config: PersistedSeatMapConfig): PersistedSeatMapConfig {
  memory.set(mapKey(config.venueId, config.eventId), config);
  venueSeatMapEngine.setMap(config.layout);
  return config;
}

async function dbGetSeatMap(
  venueId: string,
  eventId: string,
): Promise<PersistedSeatMapConfig | null> {
  await ensureVenueSeatMapSchema();
  const rows = await prisma.$queryRawUnsafe<SeatMapRow[]>(
    `SELECT * FROM "VenueSeatMap" WHERE "venueId" = $1 AND "eventId" = $2 LIMIT 1`,
    venueId,
    eventId,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

async function dbUpsertSeatMap(config: PersistedSeatMapConfig): Promise<PersistedSeatMapConfig> {
  await ensureVenueSeatMapSchema();
  const payload = JSON.stringify(toPayload(config));
  const id = rowId(config.venueId, config.eventId);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "VenueSeatMap" (
      id, "venueId", "eventId", payload, "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP, $5::timestamp
    )
    ON CONFLICT ("venueId", "eventId") DO UPDATE SET
      payload = EXCLUDED.payload,
      "updatedAt" = EXCLUDED."updatedAt"`,
    id,
    config.venueId,
    config.eventId,
    payload,
    config.updatedAt,
  );
  return config;
}

export async function getPersistedSeatMap(
  venueId: string,
  eventId?: string | null,
): Promise<PersistedSeatMapConfig> {
  const vid = venueId.trim() || "main-venue";
  const eid = (eventId ?? "").trim();

  // Always await DB so refresh / other instances see the latest map.
  const fromDb = await dbGetSeatMap(vid, eid);
  if (fromDb) {
    return cacheConfig(fromDb);
  }

  const config = buildDefaultConfig(vid, eid);
  await dbUpsertSeatMap(config);
  return cacheConfig(config);
}

export async function savePersistedSeatMap(input: {
  venueId: string;
  eventId?: string | null;
  venueName?: string;
  zones: SeatPricingZone[];
}): Promise<PersistedSeatMapConfig> {
  const venueId = input.venueId.trim();
  if (!venueId) throw new Error("venueId_required");
  if (!input.zones?.length) throw new Error("zones_required");

  const eventId = (input.eventId ?? "").trim();
  const prev = await dbGetSeatMap(venueId, eventId);
  const venueName = input.venueName ?? prev?.venueName ?? venueId;
  const layout = layoutFromZones(venueId, venueName, input.zones);
  const config: PersistedSeatMapConfig = {
    venueId,
    eventId,
    venueName,
    seatMapId: prev?.seatMapId ?? rowId(venueId, eventId),
    zones: input.zones,
    layout,
    updatedAt: new Date().toISOString(),
  };
  await dbUpsertSeatMap(config);
  return cacheConfig(config);
}

export async function updateSeatStates(
  venueId: string,
  updates: Array<{ seatId: string; status: SeatStatus }>,
  eventId?: string | null,
): Promise<PersistedSeatMapConfig> {
  const config = await getPersistedSeatMap(venueId, eventId);
  for (const u of updates) {
    for (const section of config.layout.sections) {
      const seat = section.seats.find((s) => s.id === u.seatId);
      if (seat) seat.status = u.status;
    }
  }
  config.updatedAt = new Date().toISOString();
  await dbUpsertSeatMap(config);
  return cacheConfig(config);
}
