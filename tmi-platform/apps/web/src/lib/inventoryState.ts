export type ItemType = 'prop' | 'emote';

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  owned: boolean;
};

export type Loadout = {
  prop?: string | null;
  emote?: string | null;
};

const DEFAULT_ITEMS: Item[] = [
  { id: 'prop-candle', type: 'prop', name: 'Candle', owned: true },
  { id: 'prop-glow-stick', type: 'prop', name: 'Glow Stick', owned: true },
  { id: 'prop-flashlight', type: 'prop', name: 'Flashlight', owned: false },
  { id: 'emote-wave', type: 'emote', name: 'Wave', owned: true },
  { id: 'emote-cheer', type: 'emote', name: 'Cheer', owned: true },
  { id: 'emote-clap', type: 'emote', name: 'Clap', owned: false }
];

const INVENTORY_KEY = 'bb_inventory_v1';
const LOADOUT_KEY = 'bb_loadout_v1';

export function getInventory(): Item[] {
  try {
    const raw = sessionStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw) as Item[];
  } catch (e) {}
  // initialize
  try { sessionStorage.setItem(INVENTORY_KEY, JSON.stringify(DEFAULT_ITEMS)); } catch (e) {}
  return DEFAULT_ITEMS;
}

export function saveInventory(items: Item[]) {
  try { sessionStorage.setItem(INVENTORY_KEY, JSON.stringify(items)); } catch (e) {}
}

export function getLoadout(): Loadout {
  try {
    const raw = sessionStorage.getItem(LOADOUT_KEY);
    if (raw) return JSON.parse(raw) as Loadout;
  } catch (e) {}
  const initial: Loadout = { prop: null, emote: null };
  try { sessionStorage.setItem(LOADOUT_KEY, JSON.stringify(initial)); } catch (e) {}
  return initial;
}

export function setLoadout(loadout: Loadout) {
  try { sessionStorage.setItem(LOADOUT_KEY, JSON.stringify(loadout)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('bb:loadout:changed', { detail: loadout })); } catch (e) {}
}

export function equipProp(id: string | null) {
  const l = getLoadout();
  l.prop = id;
  setLoadout(l);
}

export function equipEmote(id: string | null) {
  const l = getLoadout();
  l.emote = id;
  setLoadout(l);
}
