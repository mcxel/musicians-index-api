export type ArtifactInteractionType = "route" | "preview" | "fullscreen" | "cta";

export type ArtifactRouteContract = {
  id: string;
  type:
    | "artist-frame"
    | "sponsor-ad"
    | "advertiser-ad"
    | "billboard"
    | "game"
    | "show"
    | "lobby"
    | "venue"
    | "magazine-page"
    | "cta";
  route: string;
  previewRoute: string;
  fallbackRoute: string;
  onClickAction: ArtifactInteractionType;
  dataSource: string;
};

export type ArtifactZoneDefinition = ArtifactRouteContract & {
  homepage: "home1" | "home2" | "home3" | "home4" | "home5";
  x: number;
  y: number;
  w: number;
  h: number;
  animation: "pulse" | "float" | "ticker" | "none";
};

export function validateArtifactContract(contract: ArtifactRouteContract): string[] {
  const failures: string[] = [];
  if (!contract.id) failures.push("id");
  if (!contract.type) failures.push("type");
  if (!contract.route) failures.push("route");
  if (!contract.previewRoute) failures.push("previewRoute");
  if (!contract.fallbackRoute) failures.push("fallbackRoute");
  if (!contract.onClickAction) failures.push("onClickAction");
  if (!contract.dataSource) failures.push("dataSource");
  return failures;
}
