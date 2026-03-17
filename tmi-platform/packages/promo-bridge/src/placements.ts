import type { PlacementContext, PromoSlot } from "@tmi/contracts";
import { PROMO_REGISTRY } from "./registry";
import { applyPromoRules, DEFAULT_RULES } from "./rules";

function pickCreative(productKey: string) {
  const p = PROMO_REGISTRY.find((x) => x.key === productKey);
  if (!p) return null;
  return { product: p.key, priority: p.defaultPriority, creative: p.creatives[0] };
}

export function getPromoSlots(ctx: PlacementContext): PromoSlot[] {
  const candidates: PromoSlot[] = PROMO_REGISTRY.map((p, idx) => {
    const base = pickCreative(p.key);
    const id = `${p.key}:${idx}`;
    return {
      id,
      product: p.key,
      priority: base?.priority ?? 0,
      creative: base?.creative ?? ({} as any),
      impressionKey: id,
      // include surface for rules to inspect (may be read as any)
      surface: ctx.surface,
    } as unknown as PromoSlot;
  });

  const res = applyPromoRules({ ctx, candidates, rules: DEFAULT_RULES });
  return res.chosen ? [res.chosen] : [];
}
