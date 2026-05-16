/**
 * ArtistOutreachEngine
 * Outreach messaging and follow-up script generation for magazine artist acquisition.
 */

export type ArtistLeadTargetType =
  | "independent-artist"
  | "band"
  | "producer"
  | "dj"
  | "performer"
  | "battle-artist"
  | "cypher-artist";

export type ArtistOutreachMessagePack = {
  targetType: ArtistLeadTargetType;
  shortIntro: string;
  primaryPitch: string;
  valueBullets: string[];
  callToAction: string;
};

export type OutreachTaskStatus = "pending" | "sent" | "failed" | "replied";

export interface OutreachTask {
  taskId: string;
  leadId: string;
  script: string[];
  status: OutreachTaskStatus;
  scheduledFor: Date;
}

function targetPitch(type: ArtistLeadTargetType): string {
  switch (type) {
    case "independent-artist":
      return "Get discovered through magazine features, rankings, and contest visibility.";
    case "band":
      return "Grow your band audience with profiles, features, and event/ticket pathways.";
    case "producer":
      return "Turn production work into beat sales and magazine placement.";
    case "dj":
      return "Convert performances into bookings, ticket sales, and profile growth.";
    case "performer":
      return "Use magazine visibility to grow bookings and sponsor income.";
    case "battle-artist":
      return "Use battle visibility, rankings, and yearly contest eligibility as growth levers.";
    case "cypher-artist":
      return "Convert cypher exposure into profiles, sponsor readiness, and contest progression.";
    default:
      return "Use TMI magazine exposure to grow your artist economy.";
  }
}

export function buildArtistOutreachMessagePack(targetType: ArtistLeadTargetType): ArtistOutreachMessagePack {
  return {
    targetType,
    shortIntro: "TMI magazine helps artists convert visibility into revenue and opportunities.",
    primaryPitch: targetPitch(targetType),
    valueBullets: [
      "Magazine features, interviews, and article placements.",
      "Artist profile and weekly ranking visibility.",
      "Local and major sponsor income readiness.",
      "Booking opportunities and ticket-selling pathways.",
      "Beat-selling opportunities for producers and artist brands.",
      "Yearly contest eligibility progression.",
    ],
    callToAction: "Start onboarding now and submit your first magazine feature profile.",
  };
}

export function buildArtistFollowUpScript(targetType: ArtistLeadTargetType): string[] {
  const pack = buildArtistOutreachMessagePack(targetType);
  return [
    `Intro: ${pack.shortIntro}`,
    `Pitch: ${pack.primaryPitch}`,
    ...pack.valueBullets.map((bullet) => `Value: ${bullet}`),
    `CTA: ${pack.callToAction}`,
  ];
}

export function generateFollowUpTasks(leadId: string, targetType: ArtistLeadTargetType): OutreachTask[] {
  const script = buildArtistFollowUpScript(targetType);
  return [
    {
      taskId: `task_fu_1_${leadId}`,
      leadId,
      script: script.slice(0, 2), // Send Intro + Pitch
      status: "pending",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
    },
    {
      taskId: `task_fu_2_${leadId}`,
      leadId,
      script: script.slice(2), // Send Value + CTA
      status: "pending",
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
    },
  ];
}
