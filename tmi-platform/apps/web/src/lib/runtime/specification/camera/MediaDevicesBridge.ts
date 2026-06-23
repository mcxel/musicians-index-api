export interface MediaDevicesBridge {
  requestCameraAndMic(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  requestCamera(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  requestMicrophone(constraints?: MediaStreamConstraints): Promise<MediaStream>;
}

export const browserMediaDevicesBridge: MediaDevicesBridge = {
  async requestCameraAndMic(constraints) {
    return navigator.mediaDevices.getUserMedia(constraints ?? { video: true, audio: true });
  },
  async requestCamera(constraints) {
    return navigator.mediaDevices.getUserMedia(constraints ?? { video: true, audio: false });
  },
  async requestMicrophone(constraints) {
    return navigator.mediaDevices.getUserMedia(constraints ?? { video: false, audio: true });
  },
};
