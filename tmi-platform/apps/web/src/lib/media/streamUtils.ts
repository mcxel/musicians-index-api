export async function getHardwareStreamWithFallback(): Promise<MediaStream> {
  try {
    // Advanced WebRTC HD capture per Platform Law #5
    // Optimized for WKWebView (iOS/macOS), WPE WebKit, and desktop Chrome/Firefox
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1920, min: 1280 }, 
        height: { ideal: 1080, min: 720 }, 
        facingMode: 'user',
        frameRate: { ideal: 60, min: 30 }
      },
      audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      },
    });
    return stream;
  } catch (hdErr) {
    console.warn('[TMI_HARDWARE_WARN] HD Stream failed, degrading to standard constraints for fallback support...', hdErr);
    // Fallback for Raspberry Pi, older mobile devices, or strict permissions
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  }
}