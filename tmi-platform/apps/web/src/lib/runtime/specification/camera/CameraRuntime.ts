import type { PhotoCaptureEngine } from "./PhotoCaptureEngine";
import type { VideoCaptureEngine } from "./VideoCaptureEngine";
import type { AudioCaptureEngine } from "./AudioCaptureEngine";
import type { MediaDevicesBridge } from "./MediaDevicesBridge";

export interface CameraRuntime {
  devices: MediaDevicesBridge;
  photo: PhotoCaptureEngine;
  video: VideoCaptureEngine;
  audio: AudioCaptureEngine;
}
