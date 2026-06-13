export class MediaCaptureService {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private signalingSocket: WebSocket | null = null;

  async startCapture(
    videoElement: HTMLVideoElement,
    signalingServerUrl: string
  ) {
    try {
      // Request high quality A/V constraints natively
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, frameRate: 60 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      videoElement.srcObject = this.localStream;

      this.connectSignaling(signalingServerUrl);
      this.setupWebRTC();
    } catch (err) {
      console.error('Error accessing A/V media devices:', err);
    }
  }

  private connectSignaling(url: string) {
    this.signalingSocket = new WebSocket(url);

    this.signalingSocket.onopen = () => console.log('📡 Connected to WebRTC signaling server:', url);

    this.signalingSocket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'offer') {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection?.createAnswer();
        await this.peerConnection?.setLocalDescription(answer);
        this.signalingSocket?.send(JSON.stringify({ type: 'answer', answer }));
      } else if (data.type === 'ice-candidate') {
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };
  }

  private setupWebRTC() {
    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    this.localStream?.getTracks().forEach((track) => {
      if (this.localStream) this.peerConnection?.addTrack(track, this.localStream);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) this.signalingSocket?.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
    };
  }

  stopCapture() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.peerConnection?.close();
    this.signalingSocket?.close();
  }
}