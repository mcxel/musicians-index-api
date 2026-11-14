/**
 * P0 Lobby Route Convergence + RECORD Honesty certification (static gates).
 * LOBBY-CONV-01…07 automated; 08–09 physical; 10 refresh/direct URL structural.
 * RECORD-01…07 automated honesty checks.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "../..");

function readSrc(relPath: string): string {
  return readFileSync(path.join(root, relPath), "utf8");
}

describe("LOBBY-CONV P0 — route convergence + Mini JOIN", () => {
  const nextConfig = readSrc("next.config.js");
  const lobbyWall = readSrc("src/app/live/lobby-wall/page.tsx");
  const lobbyShim = readSrc("src/app/live/lobby/page.tsx");
  const host = readSrc("src/components/live/LiveLobbyWallHost.tsx");
  const grid = readSrc("src/components/live/LiveLobbyWallGrid.tsx");
  const mini = readSrc("src/components/lobby/MiniLiveLobbyWallRuntime.tsx");
  const instant = readSrc("src/lib/discovery/InstantJoinRuntime.ts");
  const entry = readSrc("src/components/room/UniversalLobbyEntry.tsx");

  test("LOBBY-CONV-01: canonical destination is /live/lobby-wall with LiveLobbyWallHost", () => {
    expect(existsSync(path.join(root, "src/app/live/lobby-wall/page.tsx"))).toBe(true);
    expect(lobbyWall).toContain("LiveLobbyWallHost");
    expect(lobbyWall).toMatch(/CANONICAL|All Live Stations/);
  });

  test("LOBBY-CONV-02: Host → Grid → LobbyEntryFlow chain present", () => {
    expect(host).toContain('from "@/components/live/LiveLobbyWallGrid"');
    expect(host).toContain("LobbyEntryFlow");
    expect(host).toContain("resolveInstantJoin");
    expect(grid).toContain("LobbyEntryFlow");
    expect(entry).toContain("export function LobbyEntryFlow");
  });

  test("LOBBY-CONV-03: /live/lobby redirects to canonical (config + page shim)", () => {
    expect(nextConfig).toContain("source: '/live/lobby'");
    expect(nextConfig).toContain("destination: '/live/lobby-wall'");
    expect(lobbyShim).toContain("redirect(`/live/lobby-wall");
    expect(lobbyShim).not.toContain("BillboardLiveWall");
  });

  test("LOBBY-CONV-04: /rooms/live redirects to /live/lobby-wall (not legacy lobby)", () => {
    expect(nextConfig).toContain(
      "{ source: '/rooms/live', destination: '/live/lobby-wall', permanent: false }",
    );
  });

  test("LOBBY-CONV-05: /lobbies/* and /live/lobbies redirect to canonical", () => {
    expect(nextConfig).toContain(
      "{ source: '/lobbies', destination: '/live/lobby-wall', permanent: false }",
    );
    expect(nextConfig).toContain(
      "{ source: '/lobbies/:slug', destination: '/live/lobby-wall', permanent: false }",
    );
    expect(nextConfig).toContain(
      "{ source: '/live/lobbies', destination: '/live/lobby-wall', permanent: false }",
    );
    const lobbiesPage = readSrc("src/app/lobbies/page.tsx");
    const liveLobbies = readSrc("src/app/live/lobbies/page.tsx");
    expect(lobbiesPage).toContain('redirect("/live/lobby-wall")');
    expect(liveLobbies).toContain('redirect("/live/lobby-wall")');
    expect(lobbiesPage).not.toMatch(/LOBBY_ROOMS|DEMO_LOBBIES/);
  });

  test("LOBBY-CONV-06: Mini JOIN uses LobbyEntryFlow / resolveInstantJoin (no room push bypass)", () => {
    expect(mini).toContain("LobbyEntryFlow");
    expect(mini).toContain("resolveInstantJoin");
    expect(mini).toContain("setJoinDecision");
    const joinFn = mini.slice(mini.indexOf("const handleJoin"), mini.indexOf("if (typeof document"));
    expect(joinFn).not.toContain("router.push");
    expect(joinFn).toContain("setJoinDecision");
  });

  test("LOBBY-CONV-07: role / participation awareness preserved (no flatten)", () => {
    expect(instant).toContain("resolveParticipationEntry");
    expect(instant).toContain("FAN_AVATAR_LOBBY");
    expect(instant).toContain("QUEUE");
    expect(instant).toContain("LOUNGE_PANEL");
    expect(instant).toContain("PERFORMER_LOBBY");
    expect(mini).toContain('role === "performer" ? "PERFORMER" : "FAN"');
  });

  test("LOBBY-CONV-10: refresh/direct URL — lobby-wall handles ?room= deep link", () => {
    expect(lobbyWall).toContain("searchParams");
    expect(lobbyWall).toContain("room");
    expect(lobbyWall).toContain("LobbyEntryFlow");
  });
});

describe("RECORD P0 — honesty (no phantom toggle)", () => {
  const mediaStack = readSrc("src/components/commandCenter/CommandCenterMediaStack.tsx");
  const monitor = readSrc("src/components/shell/VideoMonitorGrid.tsx");

  test("RECORD-01: hub RECORD control is disabled / unavailable", () => {
    expect(mediaStack).toContain('data-record-state="unavailable"');
    expect(mediaStack).toContain("RECORD UNAVAILABLE");
    expect(mediaStack).toContain("disabled");
  });

  test("RECORD-02: no orphan recording-toggle emit", () => {
    expect(mediaStack).not.toContain("CustomEvent('tmi:recording-toggle'");
    expect(mediaStack).not.toContain('CustomEvent("tmi:recording-toggle"');
    expect(mediaStack).not.toContain("dispatchEvent(new CustomEvent('tmi:recording-toggle'");
  });

  test("RECORD-03: no local isRecording toggle state on hub stack", () => {
    expect(mediaStack).not.toContain("setIsRecording");
    expect(mediaStack).not.toContain("toggleRecording");
  });

  test("RECORD-04: unavailable reason is explicit (not silent hide)", () => {
    expect(mediaStack).toContain("RECORD_UNAVAILABLE_REASON");
    expect(mediaStack).toContain("Session recording runtime not certified");
  });

  test("RECORD-05: no shallow MediaRecorder stub on hub RECORD path", () => {
    const aroundRecord = mediaStack.slice(
      mediaStack.indexOf("RECORD UNAVAILABLE") - 400,
      mediaStack.indexOf("RECORD UNAVAILABLE") + 200,
    );
    expect(aroundRecord).not.toContain("MediaRecorder");
  });

  test("RECORD-06: monitor Record control honest unavailable", () => {
    expect(monitor).toContain('data-record-state="unavailable"');
    expect(monitor).toContain("Record unavailable");
    expect(monitor).not.toContain("setIsRecording");
  });

  test("RECORD-07: DistributionDirector recording remains fabric-only (not claimed as hub authority)", () => {
    const director = readSrc("src/lib/liveFabric/DistributionDirector.ts");
    expect(director).toContain("startRecording");
    expect(mediaStack).not.toMatch(/from ["']@\/lib\/liveFabric\/DistributionDirector["']/);
    expect(mediaStack).not.toContain("distribution.startRecording");
  });
});

/** Physical gates — documented for operator; do not auto-pass. */
export const LOBBY_CONV_PHYSICAL_GATES = {
  "LOBBY-CONV-08": "BLOCKED — Fan click-through requires live credentials + running app",
  "LOBBY-CONV-09": "BLOCKED — Performer click-through requires live credentials + running app",
} as const;
