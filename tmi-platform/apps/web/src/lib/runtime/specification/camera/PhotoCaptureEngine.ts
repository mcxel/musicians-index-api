export interface PhotoCapture {
  blob: Blob;
  createdAtMs: number;
}

export interface PhotoCaptureEngine {
  capturePhoto(stream: MediaStream): Promise<PhotoCapture>;
}
