export interface MediaPanelState {
  panelId: string;
  title: string;
  sourceType: "live" | "playlist" | "memory" | "empty";
  sourceId?: string;
}

export interface MediaPanelEngine {
  getPanelState(userId: string): Promise<MediaPanelState[]>;
}
