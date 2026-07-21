// ─── Layer 1: Knowledge Vault (Shared Institutional Memory Engine) ───────────
// Structured institutional memory for the entire bot fleet and platform architecture.
// Captures validated platform standards, pricing rules, broadcast rules, and incident reports.

export type VaultDomain = 'platform' | 'business' | 'events' | 'ai' | 'lessons-learned' | 'incident-reports' | 'standards';

export interface KnowledgeVaultEntry {
  id: string;
  domain: VaultDomain;
  subCategory: string; // e.g., 'architecture', 'pricing', 'monday-night-stage'
  title: string;
  summary: string;
  validatedContent: string;
  authorBotId: string; // e.g., 'bot_big_ace'
  createdAt: string;
  tags: string[];
}

const KNOWLEDGE_VAULT_STORAGE_KEY = 'tmi_knowledge_vault_ledger';

export const INITIAL_KNOWLEDGE_VAULT: KnowledgeVaultEntry[] = [
  {
    id: 'kv_plat_001',
    domain: 'platform',
    subCategory: 'architecture',
    title: '3D Living Canvas OS & PBR Shader Standard',
    summary: 'Rules for 6-layer room rendering, ambient reflections, and prefers-reduced-motion fallbacks',
    validatedContent: 'All 3D canvases must use Three.js PBR materials, event-driven lightning triggers instead of infinite loops, and support @media (prefers-reduced-motion: reduce).',
    authorBotId: 'bot_big_ace',
    createdAt: '2026-07-20T22:00:00Z',
    tags: ['3d', 'pbr', 'accessibility', 'performance'],
  },
  {
    id: 'kv_biz_001',
    domain: 'business',
    subCategory: 'pricing',
    title: 'Flex Store Micro-Pricing & 7-Day Rotation Standard',
    summary: 'Standardized $0.99, $2.99, $4.99 pricing matrix & entitlement sync',
    validatedContent: 'All micro-cosmetics are priced in $0.99, $2.99, or $4.99 tiers to drive volume. Purchases instantly write to FlexStoreLedger and grant +150 XP.',
    authorBotId: 'bot_michael_charlie',
    createdAt: '2026-07-20T23:00:00Z',
    tags: ['flex-store', 'pricing', 'micro-transactions', 'entitlements'],
  },
  {
    id: 'kv_evt_001',
    domain: 'events',
    subCategory: 'monday-night-stage',
    title: "Marcel's Monday Night Stage Broadcast Specification",
    summary: 'Weekly TV broadcast rules, Crowd Energy Meter, Cartoon Tomatoes, and Bebo Hook trigger',
    validatedContent: "Monday Night Stage is open to ALL variety talent. Boo Meter at 75%+ triggers Bebo's slapstick mechanical stage hook. Performers with 3+ trophies qualify for the Grand Showcase Hall of Fame.",
    authorBotId: 'bot_bebo',
    createdAt: '2026-07-20T23:30:00Z',
    tags: ['monday-night-stage', 'bebo-hook', 'crowd-meter', 'trophies'],
  },
];

export function getKnowledgeVaultEntries(domain?: VaultDomain): KnowledgeVaultEntry[] {
  if (typeof window === 'undefined') return INITIAL_KNOWLEDGE_VAULT;
  try {
    const raw = localStorage.getItem(KNOWLEDGE_VAULT_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as KnowledgeVaultEntry[];
      return domain ? stored.filter((e) => e.domain === domain) : stored;
    }
  } catch (err) {
    console.error('Failed to parse Knowledge Vault:', err);
  }
  localStorage.setItem(KNOWLEDGE_VAULT_STORAGE_KEY, JSON.stringify(INITIAL_KNOWLEDGE_VAULT));
  return domain ? INITIAL_KNOWLEDGE_VAULT.filter((e) => e.domain === domain) : INITIAL_KNOWLEDGE_VAULT;
}

export function searchKnowledgeVault(query: string): KnowledgeVaultEntry[] {
  const all = getKnowledgeVaultEntries();
  const q = query.toLowerCase().trim();
  if (!q) return all;

  return all.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function addKnowledgeVaultEntry(entry: Omit<KnowledgeVaultEntry, 'id' | 'createdAt'>): KnowledgeVaultEntry {
  const newEntry: KnowledgeVaultEntry = {
    ...entry,
    id: `kv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const current = getKnowledgeVaultEntries();
  const updated = [newEntry, ...current];

  try {
    localStorage.setItem(KNOWLEDGE_VAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add entry to Knowledge Vault:', err);
  }

  return newEntry;
}
