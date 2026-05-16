import { emitBigAceEvent, emitSystemEvent } from "@/lib/systemEventBus";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";

type TrackOptions = {
  actor?: string;
  routeOverride?: string;
};

type HomepageArticleClick = {
  actor?: string;
  route: string;
  sourceHomepage: string;
  sourceFrame: string;
  artistId?: string;
  performerId?: string;
};

export function trackArtifactClick(contract: ArtifactRouteContract, options: TrackOptions = {}) {
  const route = options.routeOverride ?? contract.route;

  emitSystemEvent({
    type: "homepage.artifact.click",
    actor: options.actor ?? "Homepage Operator",
    sectionId: contract.id,
    route,
    message: `Artifact click ${contract.id} -> ${route}`,
  });

  emitBigAceEvent(contract.id, route);
}

export function trackArtifactPreview(contract: ArtifactRouteContract, options: TrackOptions = {}) {
  const route = options.routeOverride ?? contract.previewRoute;

  emitSystemEvent({
    type: "homepage.artifact.preview",
    actor: options.actor ?? "Homepage Operator",
    sectionId: contract.id,
    route,
    message: `Artifact preview ${contract.id} -> ${route}`,
  });
}

export function trackPipelineRoute(contract: ArtifactRouteContract, stage: "sponsor" | "lobby" | "billboard" | "game", options: TrackOptions = {}) {
  const route = options.routeOverride ?? contract.route;
  const typeMap = {
    sponsor: "pipeline.sponsor.open",
    lobby: "pipeline.lobby.open",
    billboard: "pipeline.billboard.open",
    game: "pipeline.game.open",
  } as const;

  emitSystemEvent({
    type: typeMap[stage],
    actor: options.actor ?? "Pipeline Router",
    sectionId: contract.id,
    route,
    message: `Pipeline ${stage} open ${contract.id} -> ${route}`,
  });
}

export function trackHomepageArticleClick(options: HomepageArticleClick) {
  emitSystemEvent({
    type: "homepage.artifact.click",
    actor: options.actor ?? "Homepage Article",
    sectionId: options.sourceFrame,
    route: options.route,
    message: `articleClick ${options.sourceHomepage}/${options.sourceFrame} -> ${options.route}`,
    eventName: "articleClick",
    artistId: options.artistId,
    performerId: options.performerId,
    sourceHomepage: options.sourceHomepage,
    sourceFrame: options.sourceFrame,
  });

  emitBigAceEvent(options.sourceFrame, options.route);
}
