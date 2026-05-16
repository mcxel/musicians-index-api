import { composePosterScene, type PosterSceneRecord } from '@/lib/ai-visuals/PosterSceneEngine';
import { composeTicketScene, type TicketSceneRecord } from '@/lib/ai-visuals/TicketSceneEngine';
import { composeVenueScene, type VenueSceneRecord } from '@/lib/ai-visuals/VenueSceneEngine';

export type SceneComposeRequest =
  | { type: 'venue'; input: Parameters<typeof composeVenueScene>[0] }
  | { type: 'poster'; input: Parameters<typeof composePosterScene>[0] }
  | { type: 'ticket'; input: Parameters<typeof composeTicketScene>[0] };

export type SceneComposeResult =
  | { type: 'venue'; scene: VenueSceneRecord }
  | { type: 'poster'; scene: PosterSceneRecord }
  | { type: 'ticket'; scene: TicketSceneRecord };

export function composeScene(request: SceneComposeRequest): SceneComposeResult {
  if (request.type === 'venue') {
    return { type: 'venue', scene: composeVenueScene(request.input) };
  }

  if (request.type === 'poster') {
    return { type: 'poster', scene: composePosterScene(request.input) };
  }

  return { type: 'ticket', scene: composeTicketScene(request.input) };
}
