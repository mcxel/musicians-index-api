/**
 * AttributionEngine — builds attribution metadata for Green/Yellow playback.
 * Never emits "No Copyright Intended".
 */

import { getMediaRights } from "./MediaRightsRegistry";

export type AttributionBlock = {
  assetId: string;
  line: string;
  copyrightOwner: string;
  required: boolean;
  forbiddenPhrasesBlocked: ["No Copyright Intended"];
};

export function buildAttribution(assetId: string): AttributionBlock {
  const r = getMediaRights(assetId);
  const title = r.title ?? assetId;
  const owner = r.copyrightOwner === "UNKNOWN" ? "Rights holder unknown" : r.copyrightOwner;
  return {
    assetId,
    line: `${title} — © ${owner}. Attribution required where applicable.`,
    copyrightOwner: r.copyrightOwner,
    required: r.attributionRequired || !r.hasRightsEvidence,
    forbiddenPhrasesBlocked: ["No Copyright Intended"],
  };
}
