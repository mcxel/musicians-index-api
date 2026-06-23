export interface CapturedMedia {
  mediaId: string;
  ownerId: string;
  mediaType: "photo" | "video" | "audio";
  url: string;
  createdAtMs: number;
}

export interface MediaCaptureEngine {
  saveCapture(capture: CapturedMedia): Promise<void>;
}
