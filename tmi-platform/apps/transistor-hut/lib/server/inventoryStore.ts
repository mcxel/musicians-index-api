import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface CatalogPart {
  id: string;
  name: string;
  stock: number;
}

const CATALOG_FILE = resolve(process.cwd(), "data", "inventory-catalog.json");

async function readCatalog(): Promise<CatalogPart[]> {
  try {
    const raw = await readFile(CATALOG_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CatalogPart[]) : [];
  } catch {
    return [];
  }
}

async function writeCatalog(rows: CatalogPart[]): Promise<void> {
  await mkdir(dirname(CATALOG_FILE), { recursive: true });
  await writeFile(CATALOG_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function listCatalog(): Promise<CatalogPart[]> {
  const rows = await readCatalog();
  if (rows.length > 0) {
    return rows;
  }

  const seed: CatalogPart[] = [
    { id: "BATT-PACK-01", name: "Battery Pack", stock: 48 },
    { id: "LOCK-CABLE-USB-C", name: "USB-C Lock Cable", stock: 120 },
    { id: "CHARGER-DUAL-65W", name: "Dual Charger 65W", stock: 30 },
  ];
  await writeCatalog(seed);
  return seed;
}

export async function reservePart(input: { sku: string; quantity: number }): Promise<{ ok: boolean; remaining?: number }> {
  const rows = await listCatalog();
  const index = rows.findIndex((row) => row.id === input.sku);
  if (index < 0) {
    return { ok: false };
  }

  const current = rows[index];
  if (current.stock < input.quantity) {
    return { ok: false, remaining: current.stock };
  }

  rows[index] = { ...current, stock: current.stock - input.quantity };
  await writeCatalog(rows);
  return { ok: true, remaining: rows[index].stock };
}
