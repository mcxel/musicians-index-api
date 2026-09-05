/**
 * Directly executable — run with: npx tsx apps/web/src/tests/runMessagingAgeAttribution.test.ts
 * Covers the actor-vs-target UNKNOWN_AGE attribution fix in startConversation.ts,
 * plus a regression check that the core YouthSocialGuard matrix and the
 * community-conversation exemption are both unchanged.
 */
import assert from "node:assert/strict";
import { canPrivateInteract } from "../lib/trustSafety/YouthSocialGuard";
import { mapUnknownAgeDecisionToResult } from "../lib/messaging/startConversation";
import { assertDirectThreadOneToOne } from "../lib/trustSafety/resolveYouthSocialSubject";

async function main() {
  // A — actor unverified, target verified: sender can self-repair.
  {
    const decision = canPrivateInteract(
      { userId: "sender", ageYears: null, ageAssurance: "UNVERIFIED" },
      { userId: "recipient", ageYears: 25 },
      "DM",
    );
    assert.equal(decision.allowed, false);
    assert.equal(decision.code, "UNKNOWN_AGE");
    const mapped = mapUnknownAgeDecisionToResult(decision, "fallback");
    assert.equal(mapped.code, "AGE_VERIFICATION_REQUIRED", "A: actor-unverified must map to the self-serve code");
  }

  // B — actor verified, target unverified: sender cannot self-repair someone else's account.
  {
    const decision = canPrivateInteract(
      { userId: "sender", ageYears: 30 },
      { userId: "recipient", ageYears: null, ageAssurance: "UNVERIFIED" },
      "DM",
    );
    assert.equal(decision.allowed, false);
    assert.equal(decision.code, "UNKNOWN_AGE");
    const mapped = mapUnknownAgeDecisionToResult(decision, "fallback");
    assert.equal(
      mapped.code,
      "RECIPIENT_AGE_UNVERIFIED",
      "B: recipient-unverified must NOT map to the self-serve code (that was the retry-loop bug)",
    );
  }

  // Edge — both unverified: sender's own issue takes priority (they must fix
  // themselves first regardless of the recipient's state).
  {
    const decision = canPrivateInteract(
      { userId: "sender", ageYears: null, ageAssurance: "UNVERIFIED" },
      { userId: "recipient", ageYears: null, ageAssurance: "UNVERIFIED" },
      "DM",
    );
    const mapped = mapUnknownAgeDecisionToResult(decision, "fallback");
    assert.equal(mapped.code, "AGE_VERIFICATION_REQUIRED", "both-unverified must still prompt the sender first");
  }

  // C — both verified adults: allowed, unrelated to the attribution fix.
  {
    const decision = canPrivateInteract({ userId: "a", ageYears: 25 }, { userId: "b", ageYears: 40 }, "DM");
    assert.equal(decision.allowed, true);
    assert.equal(decision.code, "ADULT_PEERS");
  }

  // D — protected minor/adult combinations: core matrix unchanged by this fix.
  {
    const teenPeers = canPrivateInteract({ userId: "t1", ageYears: 16 }, { userId: "t2", ageYears: 17 }, "DM");
    assert.equal(teenPeers.allowed, true);
    assert.equal(teenPeers.code, "YOUTH_PEERS");

    const crossBand = canPrivateInteract({ userId: "adult", ageYears: 30 }, { userId: "teen", ageYears: 16 }, "DM");
    assert.equal(crossBand.allowed, false);
    assert.equal(crossBand.code, "NO_FAMILY_LINK");

    const familyLinked = canPrivateInteract(
      { userId: "parent", ageYears: 45, familyAccountId: "fam-1" },
      { userId: "teen", ageYears: 16, familyAccountId: "fam-1" },
      "DM",
    );
    assert.equal(familyLinked.allowed, true);
    assert.equal(familyLinked.code, "SAME_FAMILY");

    const unknownEither = canPrivateInteract({ userId: "u1", ageYears: null }, { userId: "u2", ageYears: 30 }, "DM");
    assert.equal(unknownEither.allowed, false);
    assert.equal(unknownEither.code, "UNKNOWN_AGE");
  }

  // E — community conversation exemption: must bypass the guard entirely,
  // without ever touching the database, even with a would-be-blocked pair.
  {
    let threw = false;
    try {
      await assertDirectThreadOneToOne({
        conversationId: "not-the-singleton-id",
        senderId: "adult-1",
        kind: "community",
        participantIds: ["adult-1", "unverified-2"],
      });
    } catch {
      threw = true;
    }
    assert.equal(threw, false, "community-kind threads must bypass the youth guard entirely");
  }

  console.log("Messaging age-attribution tests passed (7 assertions across scenarios A-E)");
}

main().catch((err) => {
  console.error("Messaging age-attribution tests FAILED:", err);
  process.exitCode = 1;
});
