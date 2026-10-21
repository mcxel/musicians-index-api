/**
 * One stage MediaStream may paint many muted pictures.
 * Releasing a picture detaches the element. It does not stop the stream tracks.
 */

export const JUMBOTRON_AUDIO_MODE = "MUTED" as const;

export function attachMutedProgramElement(stream: MediaStream): {
  video: HTMLVideoElement;
  release: () => void;
} {
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.srcObject = stream;
  void video.play().catch(() => undefined);
  return {
    video,
    release: () => {
      video.pause();
      video.srcObject = null;
    },
  };
}
