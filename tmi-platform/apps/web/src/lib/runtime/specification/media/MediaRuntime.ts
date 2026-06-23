import type { PlaylistEngine } from "./PlaylistEngine";
import type { MediaPanelEngine } from "./MediaPanelEngine";
import type { MediaRouter } from "./MediaRouter";
import type { MediaCaptureEngine } from "./MediaCaptureEngine";
import type { ReplayEngine } from "./ReplayEngine";

export interface MediaRuntime {
  playlists: PlaylistEngine;
  panels: MediaPanelEngine;
  router: MediaRouter;
  capture: MediaCaptureEngine;
  replay: ReplayEngine;
}
