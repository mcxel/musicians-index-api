/**
 * JumbotronVariationEngine.ts — Style Variation Engine & Immutable Truth Guard
 *
 * Laws:
 * 1. Presentation STYLE may vary; TRUTH may never vary.
 * 2. Immutable economic and recipient fields remain inviolate.
 * 3. Anti-repetition presentation memory prevents monotonous repeats.
 */

import {
  type AwardVisualTreatment,
  type ImmutableRewardTruth,
  type ImmutableGiftTruth,
  type JumbotronEvent,
} from "./JumbotronContracts";

export class JumbotronVariationEngine {
  public static readonly REWARD_TREATMENTS: AwardVisualTreatment[] = [
    "SCOREBOARD_FLIP",
    "GOLD_TICKET",
    "SPINNING_NUMBER",
    "SEAT_SPOTLIGHT",
    "AVATAR_BURST",
  ];

  // Presentation-memory: stores recent treatments per category
  private static recentRewardTreatments: AwardVisualTreatment[] = [];
  private static readonly MAX_HISTORY = 4;

  /**
   * Selects an animation treatment for an award or gift while enforcing anti-repetition.
   */
  public static selectAwardTreatment(seed?: string): AwardVisualTreatment {
    const available = JumbotronVariationEngine.REWARD_TREATMENTS.filter(
      (t) => !JumbotronVariationEngine.recentRewardTreatments.includes(t)
    );

    const candidates = available.length > 0 ? available : JumbotronVariationEngine.REWARD_TREATMENTS;

    let selected: AwardVisualTreatment;
    if (seed) {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % candidates.length;
      selected = candidates[idx]!;
    } else {
      const idx = Math.floor(Math.random() * candidates.length);
      selected = candidates[idx]!;
    }

    JumbotronVariationEngine.recordTreatment(selected);
    return selected;
  }

  /**
   * Verifies that the economic and identity truth fields in a reward event have not been mutated.
   */
  public static verifyRewardTruth(
    event: JumbotronEvent,
    expectedTruth: ImmutableRewardTruth
  ): {
    isValid: boolean;
    reason: string;
  } {
    if (!event.rewardTruth) {
      return { isValid: false, reason: "Missing rewardTruth payload" };
    }

    const t = event.rewardTruth;
    if (t.recipientId !== expectedTruth.recipientId) {
      return { isValid: false, reason: `Recipient ID mismatch: ${t.recipientId} vs ${expectedTruth.recipientId}` };
    }
    if (t.amountPoints !== expectedTruth.amountPoints) {
      return { isValid: false, reason: `Points amount altered: ${t.amountPoints} vs ${expectedTruth.amountPoints}` };
    }
    if (t.sourceTransactionId !== expectedTruth.sourceTransactionId) {
      return { isValid: false, reason: "Source transaction ID corrupted" };
    }
    if (t.rewardLedgerReference !== expectedTruth.rewardLedgerReference) {
      return { isValid: false, reason: "Reward ledger reference altered" };
    }
    if (t.timestampMs !== expectedTruth.timestampMs) {
      return { isValid: false, reason: "Timestamp altered" };
    }

    return { isValid: true, reason: "Reward truth verified immutable" };
  }

  /**
   * Verifies that gift truth payload is immutable.
   */
  public static verifyGiftTruth(
    event: JumbotronEvent,
    expectedGift: ImmutableGiftTruth
  ): {
    isValid: boolean;
    reason: string;
  } {
    if (!event.giftTruth) {
      return { isValid: false, reason: "Missing giftTruth payload" };
    }

    const g = event.giftTruth;
    if (g.settledTransactionId !== expectedGift.settledTransactionId) {
      return { isValid: false, reason: "Settled transaction ID corrupted" };
    }
    if (g.amountCents !== expectedGift.amountCents) {
      return { isValid: false, reason: "Gift amount cents altered" };
    }
    if (g.recipientId !== expectedGift.recipientId) {
      return { isValid: false, reason: "Gift recipient altered" };
    }
    if (g.senderId !== expectedGift.senderId) {
      return { isValid: false, reason: "Gift sender altered" };
    }

    return { isValid: true, reason: "Gift truth verified immutable" };
  }

  private static recordTreatment(treatment: AwardVisualTreatment): void {
    JumbotronVariationEngine.recentRewardTreatments.push(treatment);
    if (JumbotronVariationEngine.recentRewardTreatments.length > JumbotronVariationEngine.MAX_HISTORY) {
      JumbotronVariationEngine.recentRewardTreatments.shift();
    }
  }

  public static resetHistory(): void {
    JumbotronVariationEngine.recentRewardTreatments = [];
  }
}
