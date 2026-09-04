/**
 * Profile Media Player API — Slice B security certification.
 */

import {
  authorizeProfileMediaPlayerPost,
  canMutateProfileMediaPlayer,
  parseProfileMediaPlayerCommand,
  isProductionCertifiedFamily,
} from "../lib/auth/profileMediaPlayerSecurity";

type SliceResult = { id: string; pass: boolean; evidence: string };

function run(): { admit: boolean; slices: SliceResult[] } {
  const slices: SliceResult[] = [];

  slices.push({
    id: "ProfileMediaPlayer.Security.RejectsUnauthenticatedPost",
    pass:
      authorizeProfileMediaPlayerPost({
        sessionUserId: null,
        sessionRole: null,
      }).ok === false,
    evidence: "POST without session → 401",
  });

  const crossUser = authorizeProfileMediaPlayerPost({
    sessionUserId: "fan-1",
    sessionRole: "FAN",
    bodyPerformerId: "performer-9",
  });
  slices.push({
    id: "ProfileMediaPlayer.Security.RejectsArbitraryPerformerId",
    pass: crossUser.ok === false && crossUser.status === 403,
    evidence: "Fan cannot mutate another performer's player",
  });

  const selfPerformer = authorizeProfileMediaPlayerPost({
    sessionUserId: "perf-1",
    sessionRole: "PERFORMER",
    bodyOwnerUserId: "perf-1",
  });
  slices.push({
    id: "ProfileMediaPlayer.Security.AllowsSelfPerformer",
    pass: selfPerformer.ok === true && selfPerformer.ownerUserId === "perf-1",
    evidence: "Performer can mutate own profile media player",
  });

  slices.push({
    id: "ProfileMediaPlayer.Security.FollowActiveCommandParse",
    pass: parseProfileMediaPlayerCommand("FOLLOW_ACTIVE") === "FOLLOW_ACTIVE",
    evidence: "FOLLOW_ACTIVE command recognized",
  });

  slices.push({
    id: "ProfileMediaPlayer.Security.StubNotProductionCertified",
    pass: isProductionCertifiedFamily("STUB") === false,
    evidence: "STUB families blocked from production equip",
  });

  slices.push({
    id: "ProfileMediaPlayer.Security.BandMemberMutation",
    pass: canMutateProfileMediaPlayer({
      sessionUserId: "band-user",
      sessionRole: "BAND",
      targetOwnerUserId: "band-lead",
      bandMemberUserIds: ["band-lead"],
    }),
    evidence: "Band role may mutate linked band owner when listed",
  });

  const admit = slices.every((s) => s.pass);
  return { admit, slices };
}

const report = run();
for (const s of report.slices) {
  console.log(`${s.pass ? "PASS" : "FAIL"} ${s.id} — ${s.evidence}`);
}
console.log(report.admit ? "ADMIT Profile Media Player Security Slice B" : "DENY — do not admit");

if (!report.admit) {
  process.exitCode = 1;
}

export { run };
