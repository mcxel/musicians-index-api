import { checkAdultAccess } from "./adultAccessGuard";

export type SafetyTestResult = {
  id: string;
  name: string;
  passed: boolean;
  expected: "allow" | "block";
  actual: "allow" | "block";
  reason: string;
  timestamp: number;
};

let testCounter = 1;

function makeResult(
  name: string,
  expected: "allow" | "block",
  actualAllowed: boolean,
  reason: string
): SafetyTestResult {
  const actual = actualAllowed ? "allow" : "block";
  return {
    id: `SAFE-TEST-${String(testCounter++).padStart(4, "0")}`,
    name,
    passed: expected === actual,
    expected,
    actual,
    reason,
    timestamp: Date.now(),
  };
}

export function runMinorSafetyTestSuite(): SafetyTestResult[] {
  const results: SafetyTestResult[] = [];

  const adultJoinMinor = checkAdultAccess({
    actorId: "test_adult_bot",
    actorType: "adult_bot",
    actorAgeClass: "test_adult",
    targetSpaceId: "minor-group-1",
    targetSpaceType: "minor-only",
    action: "join",
  });
  results.push(makeResult("test_adult bot join minor", "block", adultJoinMinor.allowed, adultJoinMinor.reason));

  const unknownJoinMinor = checkAdultAccess({
    actorId: "test_unknown",
    actorType: "account",
    actorAgeClass: "unknown",
    targetSpaceId: "minor-group-1",
    targetSpaceType: "minor-only",
    action: "join",
  });
  results.push(makeResult("unknown-age join minor", "block", unknownJoinMinor.allowed, unknownJoinMinor.reason));

  const minorJoinMinor = checkAdultAccess({
    actorId: "test_minor_bot",
    actorType: "minor_bot",
    actorAgeClass: "test_minor",
    targetSpaceId: "minor-safe-1",
    targetSpaceType: "minor-only",
    action: "join",
    safeModeApproved: true,
  });
  results.push(makeResult("test_minor join minor-safe", "allow", minorJoinMinor.allowed, minorJoinMinor.reason));

  const advertiserMessageMinor = checkAdultAccess({
    actorId: "advertiser-bot-1",
    actorType: "advertiser_bot",
    actorAgeClass: "adult",
    targetSpaceId: "minor-safe-1",
    targetSpaceType: "minor-only",
    action: "message",
  });
  results.push(makeResult("advertiser bot message minor", "block", advertiserMessageMinor.allowed, advertiserMessageMinor.reason));

  const sponsorInviteMinor = checkAdultAccess({
    actorId: "sponsor-bot-1",
    actorType: "sponsor_bot",
    actorAgeClass: "adult",
    targetSpaceId: "minor-safe-1",
    targetSpaceType: "minor-only",
    action: "invite",
  });
  results.push(makeResult("sponsor bot invite minor", "block", sponsorInviteMinor.allowed, sponsorInviteMinor.reason));

  const venueBookMinor = checkAdultAccess({
    actorId: "venue-bot-1",
    actorType: "venue_bot",
    actorAgeClass: "adult",
    targetSpaceId: "minor-safe-1",
    targetSpaceType: "minor-only",
    action: "book",
  });
  results.push(makeResult("venue bot book minor", "block", venueBookMinor.allowed, venueBookMinor.reason));

  const performerEnterMinor = checkAdultAccess({
    actorId: "performer-bot-1",
    actorType: "performer_bot",
    actorAgeClass: "adult",
    targetSpaceId: "minor-safe-1",
    targetSpaceType: "minor-only",
    action: "enter-room",
  });
  results.push(makeResult("performer bot enter minor", "block", performerEnterMinor.allowed, performerEnterMinor.reason));

  const maintenancePrivateMinor = checkAdultAccess({
    actorId: "maintenance-bot-1",
    actorType: "maintenance_bot",
    actorAgeClass: "adult",
    targetSpaceId: "minor-private-1",
    targetSpaceType: "private-minor",
    action: "enter-room",
  });
  results.push(makeResult("maintenance bot private minor", "block", maintenancePrivateMinor.allowed, maintenancePrivateMinor.reason));

  return results;
}
