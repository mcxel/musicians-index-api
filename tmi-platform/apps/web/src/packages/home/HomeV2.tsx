"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import MagazineShell from "./magazine/MagazineShell";
import MagazineSpread from "./magazine/MagazineSpread";
import HomeExperienceLayer from "./experience/HomeExperienceLayer";
import FrameSlot from "@/packages/magazine-engine/FrameSlot";
import MagazineGrid from "@/packages/magazine-engine/MagazineGrid";
import MagazinePageCanvas from "@/packages/magazine-engine/MagazinePageCanvas";
import MagazineRoot from "@/packages/magazine-engine/MagazineRoot";
import MagazineFlipViewport from "@/packages/magazine-engine/MagazineFlipViewport";
import MagazinePager from "@/packages/magazine-engine/MagazinePager";
import { MagazinePagerProvider, getCurrentIssue, useMagazinePager } from "@/packages/magazine-engine/useMagazinePager";
import { contentRegistry } from "@/packages/magazine-engine/contentRegistry";
import { zoneMaps, zonePlacements, type IssueZoneKey, type ZoneMapId } from "@/packages/magazine-engine/zoneMaps";
import NeonFrame from "@/packages/foundation-visual/NeonFrame";
import MagazineFrame from "@/packages/magazine-engine/MagazineFrame";
import StageFrame from "@/packages/foundation-visual/StageFrame";
import { ensureAllFeeds, publishHomeFeed } from "@/packages/magazine-engine/liveFeedBus";
import MagazineOpenShell from "@/packages/magazine-engine/MagazineOpenShell";

type HomeV2Props = {
  legacy?: ReactNode;
};

function HomeV2Runtime({ legacy }: HomeV2Props) {
  const { currentPage } = useMagazinePager();
  const issue = getCurrentIssue(currentPage.id) ?? currentPage;
  const mapId = (issue.zoneMap as ZoneMapId) || "home1";
  const zones = zoneMaps[mapId] ?? zoneMaps.home1;

  useEffect(() => {
    document.body.classList.add("tmi-ready");
    return () => {
      document.body.classList.remove("tmi-ready");
    };
  }, []);

  useEffect(() => {
    ensureAllFeeds();

    if (mapId === "home1") {
      return;
    }

    const publish = () => {
      const timestamp = Date.now();

      if (mapId === "home2") {
        publishHomeFeed("home2", {
          phase: "active",
          genre: issue.pageKey,
          layoutState: zones.length > 1 ? "spread" : "cover",
          timestamp,
        });
        return;
      }

      if (mapId === "home3") {
        publishHomeFeed("home3", {
          phase: "active",
          activeShow: "live-rooms",
          timestamp,
        });
        return;
      }

      if (mapId === "home4") {
        publishHomeFeed("home4", {
          phase: "active",
          marketplaceState: "game-engine-live",
          timestamp,
        });
        return;
      }

      if (mapId === "home5") {
        publishHomeFeed("home5", {
          phase: "active",
          leaderboardState: "global-rank-live",
          timestamp,
        });
      }
    };

    publish();
    const id = window.setInterval(publish, 600);
    return () => window.clearInterval(id);
  }, [mapId, issue.pageKey, zones.length]);

  function renderZone(zone: IssueZoneKey) {
    const placement = zonePlacements[mapId][zone];
    if (!placement) return null;

    const ZoneComponent = contentRegistry[zone];
    if (!ZoneComponent) return null;

    const payload = (
      <div data-issue-zone={zone} data-zone-map={mapId} className="h-full">
        <ZoneComponent issue={issue} />
      </div>
    );

    return (
      <FrameSlot
        key={`${mapId}-${zone}`}
        colStart={placement.colStart}
        colSpan={placement.colSpan}
        rowStart={placement.rowStart}
        rowSpan={placement.rowSpan}
      >
        {placement.frame === "print" ? (
          <MagazineFrame className="h-full overflow-hidden">{payload}</MagazineFrame>
        ) : issue.theme === "live" ? (
          <StageFrame className="h-full min-h-full overflow-hidden" data-theme-frame="stage">
            {payload}
          </StageFrame>
        ) : (
          <NeonFrame
            size={placement.size}
            className="h-full overflow-hidden"
            data-theme-frame="neon"
          >
            {payload}
          </NeonFrame>
        )}
      </FrameSlot>
    );
  }

  const coverZone: IssueZoneKey = zones[0] ?? "coverFront";
  const spreadZones = zones.filter((zone) => zone !== coverZone);
  const leftZones = spreadZones.filter((zone) => zonePlacements[mapId][zone]?.page === "left");
  const rightZones = spreadZones.filter((zone) => zonePlacements[mapId][zone]?.page === "right");

  const CoverZoneComponent = contentRegistry[coverZone] ?? contentRegistry.coverFront;

  return (
    <MagazineOpenShell openAfterMs={25000}>
    <MagazineFlipViewport>
      <div
        className="homev2-root"
        data-homev2="active"
        data-theme={issue.theme}
        data-theme-frame={issue.theme === "live" ? "stage" : "magazine"}
        data-issue-slug={issue.slug}
        data-issue-id={issue.id}
      >
        <header className="homev2-issue-header" data-mag-zone="issue-header">
          <p className="homev2-issue-header__kicker">{issue.pageKey.toUpperCase()} ISSUE</p>
          <h1 className="homev2-issue-header__title">{issue.title}</h1>
          <p className="homev2-issue-header__subtitle">{issue.subtitle}</p>
        </header>

        <div className="homev2-stage" data-mag-zone="shell">
          <MagazineShell
            cover={
              <div data-mag-zone="cover" data-zone-map={mapId}>
                <CoverZoneComponent issue={issue} />
              </div>
            }
            spread={
              <div data-mag-zone="spread" data-zone-map={mapId}>
                <MagazineSpread
                  left={
                    <MagazinePageCanvas data-mag-zone="left-page">
                      <MagazineGrid>{leftZones.map((zone) => renderZone(zone))}</MagazineGrid>
                    </MagazinePageCanvas>
                  }
                  right={
                    <MagazinePageCanvas data-mag-zone="right-page">
                      <MagazineGrid>{rightZones.map((zone) => renderZone(zone))}</MagazineGrid>
                    </MagazinePageCanvas>
                  }
                />
              </div>
            }
          />
        </div>
        {mapId !== "home1" && mapId !== "home2" && mapId !== "home3" && mapId !== "home4" && mapId !== "home5" ? <HomeExperienceLayer /> : null}
        <div className="homev2-legacy-wrap" aria-hidden>
          {legacy}
        </div>
      </div>
    </MagazineFlipViewport>
    </MagazineOpenShell>
  );
}

export default function HomeV2({ legacy }: HomeV2Props) {
  return (
    <MagazineRoot>
      <MagazinePagerProvider>
        <HomeV2Runtime legacy={legacy} />
        <MagazinePager />
      </MagazinePagerProvider>
    </MagazineRoot>
  );
}
