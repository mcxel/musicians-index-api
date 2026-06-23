export interface VideoCaptureSession {
  recorder: MediaRecorder;
  startedAtMs: number;
}

export interface VideoCaptureEngine {
  startVideoCapture(stream: MediaStream): Promise<VideoCaptureSession>;
  stopVideoCapture(session: VideoCaptureSession): Promise<Blob>;
}
