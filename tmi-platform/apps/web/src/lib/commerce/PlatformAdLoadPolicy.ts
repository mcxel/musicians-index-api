/**
 * PlatformAdLoadPolicy — PERSONAL PLATFORM_AD load ladder.
 *
 * §10445 / certified source: CanonicalPricingRegistry.MEMBER_PLATFORM_AD_LOAD_PERCENT
 * FREE 100% … DIAMOND 5%. Does NOT govern venue Jumbotron / PERFORMANCE_NATIVE.
 *
 * This file re-exports the registry — do not maintain a second DIAMOND value here.
 */

export {
  MEMBER_PLATFORM_AD_LOAD_PERCENT,
  getPlatformAdLoadPercent,
} from "@/lib/commerce/CanonicalPricingRegistry";
