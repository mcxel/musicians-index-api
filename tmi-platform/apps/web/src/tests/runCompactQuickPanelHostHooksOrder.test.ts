/**
 * R-LEG-08 — CompactQuickPanelHost Rules-of-Hooks order (Batch 001).
 * Static + structural gates: no useEffect after the first conditional return.
 * Preserves desktop LOBBIES → DRAWER and mobile LOBBIES → MiniLiveLobbyWallRuntime.
 */
import { readFileSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "../..");
const hostRel = "src/components/hud/CompactQuickPanelHost.tsx";
const hostSrc = readFileSync(path.join(root, hostRel), "utf8");

/** Extract CompactQuickPanelHost function body (default export only). */
function defaultExportBody(src: string): string {
  const start = src.indexOf("export default function CompactQuickPanelHost");
  expect(start).toBeGreaterThanOrEqual(0);
  const snips = src.indexOf("export function SnipsOverlayHost");
  expect(snips).toBeGreaterThan(start);
  return src.slice(start, snips);
}

describe("R-LEG-08 CompactQuickPanelHost hooks order", () => {
  const body = defaultExportBody(hostSrc);

  test("R-LEG-08-01: all useEffect calls appear before first conditional return", () => {
    const firstReturnNull = body.search(/if\s*\(\s*!activePanel\s*\)\s*return\s+null/);
    expect(firstReturnNull).toBeGreaterThan(0);

    const beforeReturns = body.slice(0, firstReturnNull);
    const afterReturns = body.slice(firstReturnNull);

    const effectsBefore = (beforeReturns.match(/React\.useEffect\s*\(/g) ?? []).length;
    const effectsAfter = (afterReturns.match(/React\.useEffect\s*\(/g) ?? []).length;

    expect(effectsBefore).toBeGreaterThanOrEqual(2);
    expect(effectsAfter).toBe(0);
  });

  test("R-LEG-08-02: desktop lobbies still presentCanonicalWorkspace lobby DRAWER", () => {
    expect(body).toContain('presentCanonicalWorkspace("lobby", "DRAWER")');
    expect(body).toContain('activePanel !== "lobbies"');
    expect(body).toContain('matchMedia("(max-width: 900px)")');
  });

  test("R-LEG-08-03: mobile lobbies still mounts MiniLiveLobbyWallRuntime", () => {
    expect(hostSrc).toContain('from "@/components/lobby/MiniLiveLobbyWallRuntime"');
    expect(body).toContain("<MiniLiveLobbyWallRuntime");
    expect(body).toContain('activePanel === "lobbies"');
  });

  test("R-LEG-08-04: performer avatar panel still gated null", () => {
    expect(body).toContain('activePanel === "avatar" && role === "performer"');
    expect(body).toContain('RoleGate allow={["FAN", "ADMIN", "STAFF"]}');
  });

  test("R-LEG-08-05: no CompactQuickPanelHost2 / LobbyWall2 / alternate store", () => {
    expect(hostSrc).not.toMatch(/CompactQuickPanelHost2/);
    expect(hostSrc).not.toMatch(/LobbyWall2/);
    expect(hostSrc).toContain("useCompactQuickPanelStore");
    expect(hostSrc).not.toMatch(/useCompactQuickPanelStore2/);
  });

  test("R-LEG-08-06: HubMobileQuickActionBar still opens lobbies via store", () => {
    const bar = readFileSync(
      path.join(root, "src/components/commandCenter/HubMobileQuickActionBar.tsx"),
      "utf8",
    );
    expect(bar).toContain('openPanel("lobbies"');
  });

  test("R-LEG-08-07: CommandCenterShell mounts CompactQuickPanelHost (Fan+Performer hub)", () => {
    const shell = readFileSync(
      path.join(root, "src/components/commandCenter/CommandCenterShell.tsx"),
      "utf8",
    );
    expect(shell).toContain("CompactQuickPanelHost");
    expect(shell).toContain("<CompactQuickPanelHost");
  });
});
