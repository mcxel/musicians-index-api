/**
 * Server-side durable store for published YoPho interactive cards.
 * Persists to disk (.data/yopho_cards.json) with in-memory cache for speed.
 * Survives process restarts, sleep/wake, reloads, and multi-device access.
 *
 * YoPho Lounge Wall Placement Law (deferred post-Step 5A):
 * `.cursor/artifacts/yopho-lounge/TMI_YOPHO_LOUNGE_WALL_PLACEMENT_LAW.md`
 * This store is authoring/publish persistence only - not lounge socket placement.
 */

import type { PublishedYoPhoCard } from "./YoPhoCardRegistry";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const CARDS_FILE = path.join(DATA_DIR, "yopho_cards.json");

const cards = new Map<string, PublishedYoPhoCard>();
let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  try {
    if (fs.existsSync(CARDS_FILE)) {
      const raw = fs.readFileSync(CARDS_FILE, "utf-8");
      const list = JSON.parse(raw) as PublishedYoPhoCard[];
      if (Array.isArray(list)) {
        for (const c of list) {
          if (c && c.cardId) {
            cards.set(c.cardId, c);
          }
        }
      }
    }
  } catch (err) {
    console.error("[YoPhoCardStore] Failed to load cards from file:", err);
  }
}

function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(cards.values());
    fs.writeFileSync(CARDS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[YoPhoCardStore] Failed to persist cards to file:", err);
  }
}

export function upsertYoPhoCard(card: PublishedYoPhoCard): PublishedYoPhoCard {
  ensureInitialized();
  const next = { ...card, updatedAt: new Date().toISOString() };
  cards.set(next.cardId, next);
  persistToFile();
  return next;
}

export function getYoPhoCard(cardId: string): PublishedYoPhoCard | null {
  ensureInitialized();
  return cards.get(cardId) ?? null;
}

export function listYoPhoCards(limit = 40): PublishedYoPhoCard[] {
  ensureInitialized();
  return Array.from(cards.values())
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}
