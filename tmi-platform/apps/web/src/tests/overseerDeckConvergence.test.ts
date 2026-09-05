import {
  commandViewToDeskPanel,
  controlRailChangesIntelligenceDeckOnly,
  desktopMonitorNotSquished,
  desktopMonitorStageStyle,
  monitorAIndependentFromMonitorB,
  monitorSourcePickerEligible,
  sideCardToDeskPanel,
} from "@/lib/admin/overseerDeckConvergence";
import { createEmptyMonitorState, swapMonitorSources } from "@/lib/admin/overseerMonitorState";
import { LIVE_MONITOR_SOURCE_REGISTRY } from "@/components/admin/overseer/workspace/widgets/MediaSourceRegistry";

describe("overseerDeckConvergence", () => {
  describe("desktopMonitorNotSquished", () => {
    it("returns true on desktop with vw-based min height and no squish cap", () => {
      const style = desktopMonitorStageStyle(true);
      expect(
        desktopMonitorNotSquished(true, style.minHeight, style.maxHeight),
      ).toBe(true);
    });

    it("returns false on mobile", () => {
      expect(desktopMonitorNotSquished(false, "min(56vw, 720px)", "none")).toBe(false);
    });
  });

  describe("controlRailDoesNotChangeMonitor", () => {
    it("control rail actions target intelligence deck only", () => {
      expect(controlRailChangesIntelligenceDeckOnly("analytics")).toBe(true);
      expect(controlRailChangesIntelligenceDeckOnly("OVERVIEW")).toBe(true);
    });
  });

  describe("controlRailChangesIntelligenceDeck", () => {
    it("maps command views to desk panels for intelligence focus", () => {
      expect(commandViewToDeskPanel("dynamics")).toBe("analytics");
      expect(commandViewToDeskPanel("observatory")).toBe("rooms");
      expect(commandViewToDeskPanel("runtime-check")).toBe("system-health");
    });
  });

  describe("monitorAIndependentFromMonitorB", () => {
    it("assigns A and B independently", () => {
      const empty = createEmptyMonitorState();
      const next = monitorAIndependentFromMonitorB(empty, "A", "battle", "B", "cypher");
      expect(next.A.sourceId).toBe("battle");
      expect(next.B.sourceId).toBe("cypher");
      expect(next.C.sourceId).toBeNull();
    });
  });

  describe("monitorSourcePicker", () => {
    it("only allows live monitor registry ids", () => {
      const liveIds = LIVE_MONITOR_SOURCE_REGISTRY.map((s) => s.id);
      expect(monitorSourcePickerEligible("battle", liveIds)).toBe(true);
      expect(monitorSourcePickerEligible("revenue", liveIds)).toBe(false);
    });
  });

  describe("sideCardToDeskPanel", () => {
    it("maps side cards to intelligence workspaces", () => {
      expect(sideCardToDeskPanel("bot-roster")).toBe("bots");
      expect(sideCardToDeskPanel("unified-inbox")).toBe("submissions");
      expect(sideCardToDeskPanel("sentinel-wall")).toBe("alerts");
    });
  });

  describe("monitorStateHelpers", () => {
    it("swaps A and B independently", () => {
      const base = monitorAIndependentFromMonitorB(
        createEmptyMonitorState(),
        "A",
        "live:a",
        "B",
        "live:b",
      );
      const swapped = swapMonitorSources(base, "A", "B");
      expect(swapped.A.sourceId).toBe("live:b");
      expect(swapped.B.sourceId).toBe("live:a");
    });
  });
});
