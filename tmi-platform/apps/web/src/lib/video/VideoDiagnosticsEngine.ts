import type { PictureInPictureFeed } from "@/lib/video/PictureInPictureEngine";

export type ObservatoryFeedCategory =
  | "artist-stream"
  | "performer-stream"
  | "venue-stream"
  | "host-stream"
  | "battle-stream"
  | "cypher-stream"
  | "ticketed-event"
  | "admin-camera"
  | "bot-simulation";

export type ObservatoryFeed = PictureInPictureFeed & {
  category: ObservatoryFeedCategory;
  streamStatus: "live" | "buffering" | "offline";
  droppedFrames: number;
  disconnects: number;
  cameraFailures: number;
  pipFailures: number;
  feedFailures: number;
  chatVelocity: number;
  ticketVelocity: number;
  tipsPerMinute: number;
  votesPerMinute: number;
  motionPortrait: string;
  activity: string[];
};

export type VideoDiagnosticsSnapshot = {
  feeds: ObservatoryFeed[];
  summary: {
    totalFeeds: number;
    liveFeeds: number;
    bufferingFeeds: number;
    offlineFeeds: number;
    droppedFrames: number;
    disconnects: number;
    cameraFailures: number;
    pipFailures: number;
    feedFailures: number;
  };
  alerts: Array<{
    alertId: string;
    feedId: string;
    severity: "info" | "warning" | "critical";
    message: string;
  }>;
};

const OBSERVATORY_FEEDS: ObservatoryFeed[] = [
  {
    feedId: "artist-ray-journey",
    label: "Ray Journey",
    route: "/artists/ray-journey",
    type: "artist",
    category: "artist-stream",
    cameraLabel: "artist cam",
    previewImage: "/tmi-curated/host-main.png",
    motionPortrait: "/tmi-curated/mag-35.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 12,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 42,
    ticketVelocity: 0,
    tipsPerMinute: 7,
    votesPerMinute: 11,
    activity: ["rank jump locked", "article traffic spike", "tips active"],
  },
  {
    feedId: "performer-nova-cipher",
    label: "Nova Cipher",
    route: "/performers/nova-cipher",
    type: "performer",
    category: "performer-stream",
    cameraLabel: "performer cam",
    previewImage: "/tmi-curated/mag-66.jpg",
    motionPortrait: "/tmi-curated/mag-58.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 8,
    disconnects: 1,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 58,
    ticketVelocity: 0,
    tipsPerMinute: 12,
    votesPerMinute: 18,
    activity: ["battle lobby hot", "crowd vote open", "host handshake"],
  },
  {
    feedId: "venue-neon-stage",
    label: "Neon Stage",
    route: "/venues/neon-stage/live",
    type: "venue",
    category: "venue-stream",
    cameraLabel: "stage cam",
    previewImage: "/tmi-curated/venue-10.jpg",
    motionPortrait: "/tmi-curated/venue-22.jpg",
    live: true,
    streamStatus: "buffering",
    droppedFrames: 33,
    disconnects: 2,
    cameraFailures: 1,
    pipFailures: 1,
    feedFailures: 1,
    chatVelocity: 17,
    ticketVelocity: 14,
    tipsPerMinute: 4,
    votesPerMinute: 0,
    activity: ["vip cam drift", "crowd cam reconnect", "lobby queue building"],
  },
  {
    feedId: "host-tiana",
    label: "Tiana Host",
    route: "/venues/tiana-monday-night-stage-host/host",
    type: "host",
    category: "host-stream",
    cameraLabel: "host cam",
    previewImage: "/tmi-curated/host-main.png",
    motionPortrait: "/tmi-curated/host-4.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 4,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 24,
    ticketVelocity: 6,
    tipsPerMinute: 3,
    votesPerMinute: 5,
    activity: ["intro live", "host cue sent", "profile spotlight armed"],
  },
  {
    feedId: "battle-ring-01",
    label: "Battle Ring",
    route: "/song-battle/live",
    type: "battle",
    category: "battle-stream",
    cameraLabel: "battle cam",
    previewImage: "/tmi-curated/mag-35.jpg",
    motionPortrait: "/tmi-curated/mag-66.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 16,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 66,
    ticketVelocity: 0,
    tipsPerMinute: 9,
    votesPerMinute: 29,
    activity: ["round 2 vote lock", "judge panel armed", "crowd meter surge"],
  },
  {
    feedId: "cypher-monday",
    label: "Monday Cypher",
    route: "/cypher",
    type: "cypher",
    category: "cypher-stream",
    cameraLabel: "cypher cam",
    previewImage: "/tmi-curated/home1.jpg",
    motionPortrait: "/tmi-curated/mag-58.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 7,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 81,
    ticketVelocity: 0,
    tipsPerMinute: 14,
    votesPerMinute: 31,
    activity: ["freestyle queue hot", "confetti trigger ready", "crown challenger entering"],
  },
  {
    feedId: "ticketed-premiere",
    label: "Ticketed Premiere",
    route: "/events/live",
    type: "ticketed-event",
    category: "ticketed-event",
    cameraLabel: "event feed",
    previewImage: "/tmi-curated/mag-66.jpg",
    motionPortrait: "/tmi-curated/mag-35.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 5,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 1,
    feedFailures: 0,
    chatVelocity: 38,
    ticketVelocity: 48,
    tipsPerMinute: 19,
    votesPerMinute: 22,
    activity: ["ticket validate burst", "tip flood", "chat chain trending"],
  },
  {
    feedId: "admin-lobby-cam",
    label: "Admin Lobby Cam",
    route: "/admin/video-wall",
    type: "admin-camera",
    category: "admin-camera",
    cameraLabel: "admin cam",
    previewImage: "/tmi-curated/venue-22.jpg",
    motionPortrait: "/tmi-curated/venue-10.jpg",
    live: true,
    streamStatus: "live",
    droppedFrames: 2,
    disconnects: 0,
    cameraFailures: 0,
    pipFailures: 0,
    feedFailures: 0,
    chatVelocity: 0,
    ticketVelocity: 0,
    tipsPerMinute: 0,
    votesPerMinute: 0,
    activity: ["command wall clear", "dock synced", "ops deck aligned"],
  },
  {
    feedId: "bot-sim-alpha",
    label: "Bot Sim Alpha",
    route: "/admin/bots/observe",
    type: "bot",
    category: "bot-simulation",
    cameraLabel: "bot sim",
    previewImage: "/assets/avatars/default-avatar.jpg",
    motionPortrait: "/tmi-curated/mag-58.jpg",
    live: false,
    streamStatus: "offline",
    droppedFrames: 0,
    disconnects: 4,
    cameraFailures: 2,
    pipFailures: 1,
    feedFailures: 2,
    chatVelocity: 11,
    ticketVelocity: 2,
    tipsPerMinute: 1,
    votesPerMinute: 4,
    activity: ["login replay queued", "purchase stub triggered", "vote script active"],
  },
];

export function listObservatoryFeeds(): ObservatoryFeed[] {
  return OBSERVATORY_FEEDS;
}

export function listObservatoryFeedsByCategory(category: ObservatoryFeedCategory): ObservatoryFeed[] {
  return OBSERVATORY_FEEDS.filter((feed) => feed.category === category);
}

export function listPictureInPictureEligibleFeeds(): PictureInPictureFeed[] {
  return OBSERVATORY_FEEDS.filter((feed) =>
    ["artist-stream", "host-stream", "venue-stream", "battle-stream", "admin-camera"].includes(feed.category),
  ).map((feed) => ({
    feedId: feed.feedId,
    label: feed.label,
    route: feed.route,
    type: feed.type,
    cameraLabel: feed.cameraLabel,
    previewImage: feed.previewImage,
    live: feed.live,
  }));
}

export function getVideoDiagnosticsSnapshot(): VideoDiagnosticsSnapshot {
  const feeds = listObservatoryFeeds();
  const alerts = feeds.flatMap((feed) => {
    const nextAlerts: VideoDiagnosticsSnapshot["alerts"] = [];
    if (feed.streamStatus === "buffering") {
      nextAlerts.push({
        alertId: `${feed.feedId}-buffering`,
        feedId: feed.feedId,
        severity: "warning",
        message: `${feed.label} is buffering and losing frames.`,
      });
    }
    if (feed.cameraFailures > 0 || feed.feedFailures > 0) {
      nextAlerts.push({
        alertId: `${feed.feedId}-failure`,
        feedId: feed.feedId,
        severity: "critical",
        message: `${feed.label} has camera/feed failures requiring intervention.`,
      });
    }
    if (feed.pipFailures > 0) {
      nextAlerts.push({
        alertId: `${feed.feedId}-pip`,
        feedId: feed.feedId,
        severity: "info",
        message: `${feed.label} reported PiP drift or focus swap failures.`,
      });
    }
    return nextAlerts;
  });

  return {
    feeds,
    summary: {
      totalFeeds: feeds.length,
      liveFeeds: feeds.filter((feed) => feed.streamStatus === "live").length,
      bufferingFeeds: feeds.filter((feed) => feed.streamStatus === "buffering").length,
      offlineFeeds: feeds.filter((feed) => feed.streamStatus === "offline").length,
      droppedFrames: feeds.reduce((total, feed) => total + feed.droppedFrames, 0),
      disconnects: feeds.reduce((total, feed) => total + feed.disconnects, 0),
      cameraFailures: feeds.reduce((total, feed) => total + feed.cameraFailures, 0),
      pipFailures: feeds.reduce((total, feed) => total + feed.pipFailures, 0),
      feedFailures: feeds.reduce((total, feed) => total + feed.feedFailures, 0),
    },
    alerts,
  };
}