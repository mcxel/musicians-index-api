/**
 * MEDIA MESH ENGINE - CORE ORCHESTRATOR
 * Bridges hardware streams (cv2, WebKit, USB, Pi) to the TMI-OS WebTexture layer.
 */
export class MediaOrchestrator {
  private activeStream: MediaStream | null = null;

  /**
   * Initializes the HD Video Transmission. 
   * Enforces 1080p60 optimal settings with echo cancellation.
   */
  public async initiateTransmission(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.activeStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.activeStream;
    } catch (error) {
      console.error('MediaOrchestrator [FATAL]: Hardware access denied or unavailable.', error);
      throw new Error('MEDIA_MESH_ACCESS_DENIED');
    }
  }

  /**
   * Safely cuts the transmission and releases hardware locks.
   */
  public cutTransmission(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
  }

  /**
   * Attaches the hardware stream to a UI Video/WebTexture element.
   */
  public attachToNode(videoElement: HTMLVideoElement, stream: MediaStream): void {
    if (videoElement) {
      videoElement.srcObject = stream;
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(e => console.error('Playback failed', e));
      };
    }
  }
}

export const mediaMesh = new MediaOrchestrator();