export interface AudioCaptureSession {
  recorder: MediaRecorder;
  startedAtMs: number;
}

export interface AudioCaptureEngine {
  startAudioCapture(stream: MediaStream): Promise<AudioCaptureSession>;
  stopAudioCapture(session: AudioCaptureSession): Promise<Blob>;
}
