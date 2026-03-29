// ============================================================
// AVATAR COSTUME REGISTRY
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarCostumeCategory, AvatarEvolutionTier } from './types';

export interface CostumeDefinition {
  id: string;
  label: string;
  category: AvatarCostumeCategory;
  requiredTier: AvatarEvolutionTier;
  items: CostumeItem[];
  venueTheme?: string;
  sponsorBranded?: boolean;
  previewAsset?: string;
}

export interface CostumeItem {
  slot: 'hat' | 'glasses' | 'jacket' | 'shirt' | 'pants' | 'shoes' | 'chain' | 'accessory';
  assetId: string;
  label: string;
  animated?: boolean;
}

export const COSTUME_REGISTRY: CostumeDefinition[] = [
  {
    id: 'casual-default',
    label: 'Casual Default',
    category: 'casual',
    requiredTier: 'starter',
    items: [
      { slot: 'shirt', assetId: 'shirt-casual-01', label: 'Basic Tee' },
      { slot: 'pants', assetId: 'pants-casual-01', label: 'Jeans' },
      { slot: 'shoes', assetId: 'shoes-casual-01', label: 'Sneakers' },
    ],
  },
  {
    id: 'stage-performer',
    label: 'Stage Performer',
    category: 'stage',
    requiredTier: 'rising',
    items: [
      { slot: 'jacket', assetId: 'jacket-stage-01', label: 'Stage Jacket' },
      { slot: 'shirt', assetId: 'shirt-stage-01', label: 'Performance Shirt' },
      { slot: 'pants', assetId: 'pants-stage-01', label: 'Stage Pants' },
      { slot: 'shoes', assetId: 'shoes-stage-01', label: 'Stage Boots' },
    ],
  },
  {
    id: 'vip-elite',
    label: 'VIP Elite',
    category: 'vip',
    requiredTier: 'established',
    items: [
      { slot: 'jacket', assetId: 'jacket-vip-01', label: 'VIP Blazer' },
      { slot: 'shirt', assetId: 'shirt-vip-01', label: 'VIP Dress Shirt' },
      { slot: 'chain', assetId: 'chain-vip-01', label: 'Gold Chain', animated: true },
      { slot: 'glasses', assetId: 'glasses-vip-01', label: 'Designer Shades' },
    ],
  },
  {
    id: 'cypher-street',
    label: 'Cypher Street',
    category: 'cypher',
    requiredTier: 'rising',
    items: [
      { slot: 'hat', assetId: 'hat-cypher-01', label: 'Snapback' },
      { slot: 'jacket', assetId: 'jacket-cypher-01', label: 'Hoodie' },
      { slot: 'pants', assetId: 'pants-cypher-01', label: 'Cargo Pants' },
      { slot: 'shoes', assetId: 'shoes-cypher-01', label: 'High Tops' },
    ],
  },
  {
    id: 'contest-champion',
    label: 'Contest Champion',
    category: 'contest',
    requiredTier: 'featured',
    items: [
      { slot: 'jacket', assetId: 'jacket-contest-01', label: 'Champion Jacket' },
      { slot: 'hat', assetId: 'hat-contest-01', label: 'Champion Cap' },
      { slot: 'chain', assetId: 'chain-contest-01', label: 'Trophy Chain', animated: true },
    ],
  },
  {
    id: 'formal-gala',
    label: 'Formal Gala',
    category: 'formal',
    requiredTier: 'established',
    items: [
      { slot: 'jacket', assetId: 'jacket-formal-01', label: 'Tuxedo Jacket' },
      { slot: 'shirt', assetId: 'shirt-formal-01', label: 'Dress Shirt' },
      { slot: 'pants', assetId: 'pants-formal-01', label: 'Dress Pants' },
      { slot: 'shoes', assetId: 'shoes-formal-01', label: 'Dress Shoes' },
    ],
  },
  {
    id: 'legendary-icon',
    label: 'Legendary Icon',
    category: 'stage',
    requiredTier: 'legendary',
    items: [
      { slot: 'jacket', assetId: 'jacket-legend-01', label: 'Icon Jacket', animated: true },
      { slot: 'chain', assetId: 'chain-legend-01', label: 'Platinum Chain', animated: true },
      { slot: 'glasses', assetId: 'glasses-legend-01', label: 'Icon Shades' },
      { slot: 'hat', assetId: 'hat-legend-01', label: 'Icon Hat' },
    ],
  },
];

export function getCostumeById(id: string): CostumeDefinition | undefined {
  return COSTUME_REGISTRY.find((c) => c.id === id);
}

export function getCostumesByTier(tier: AvatarEvolutionTier): CostumeDefinition[] {
  const tierOrder: AvatarEvolutionTier[] = ['starter', 'rising', 'established', 'featured', 'legendary'];
  const tierIndex = tierOrder.indexOf(tier);
  return COSTUME_REGISTRY.filter((c) => tierOrder.indexOf(c.requiredTier) <= tierIndex);
}

export function getCostumesByCategory(category: AvatarCostumeCategory): CostumeDefinition[] {
  return COSTUME_REGISTRY.filter((c) => c.category === category);
}
