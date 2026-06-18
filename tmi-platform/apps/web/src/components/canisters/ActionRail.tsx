"use client";

export type CaptureResolution = "720p" | "1080p" | "1440p" | "4K" | "8K" | "AUTO";

interface ActionRailProps {
  cameraOn: boolean;
  micOn: boolean;
  speakerOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera?: () => void;
  onFullscreen?: () => void;
  onLeave?: () => void;
  /** Tiered camera architecture: capture/record resolution only — never
   *  forces live-stream quality, which stays device/bandwidth-adaptive. */
  resolution?: CaptureResolution;
  onCycleResolution?: () => void;
  isRecording?: boolean;
  onToggleRecord?: () => void;
  accentColor?: string;
}

/**
 * Single reusable action rail (Video Panel Certification): camera, mic,
 * speaker, fullscreen, switch camera, leave — one component, one source of
 * truth, used on every video/audio surface instead of bespoke per-room
 * controls. One-click, no hidden menus, no browser-back required.
 */
export default function ActionRail({
  cameraOn,
  micOn,
  speakerOn,
  onToggleCamera,
  onToggleMic,
  onToggleSpeaker,
  onSwitchCamera,
  onFullscreen,
  onLeave,
  resolution,
  onCycleResolution,
  isRecording = false,
  onToggleRecord,
  accentColor = "#00FFFF",
}: ActionRailProps) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `1.5px solid ${active ? accentColor : "rgba(255,255,255,0.2)"}`,
    background: active ? `${accentColor}22` : "rgba(255,255,255,0.04)",
    color: active ? accentColor : "rgba(255,255,255,0.5)",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button onClick={onToggleCamera} title={cameraOn ? "Turn camera off" : "Turn camera on"} style={btnStyle(cameraOn)}>
        {cameraOn ? "🎥" : "📷"}
      </button>
      <button onClick={onToggleMic} title={micOn ? "Mute mic" : "Unmute mic"} style={btnStyle(micOn)}>
        {micOn ? "🎤" : "🔇"}
      </button>
      <button onClick={onToggleSpeaker} title={speakerOn ? "Mute speaker" : "Unmute speaker"} style={btnStyle(speakerOn)}>
        {speakerOn ? "🔊" : "🔈"}
      </button>
      {onSwitchCamera && (
        <button onClick={onSwitchCamera} title="Switch camera" style={btnStyle(false)}>🔄</button>
      )}
      {onFullscreen && (
        <button onClick={onFullscreen} title="Fullscreen" style={btnStyle(false)}>📺</button>
      )}
      {onCycleResolution && (
        <button
          onClick={onCycleResolution}
          title="Capture/record resolution (does not change live stream quality)"
          style={{ ...btnStyle(false), width: "auto", padding: "0 8px", fontSize: 9, fontWeight: 800, borderRadius: 18 }}
        >
          🎞 {resolution ?? "AUTO"}
        </button>
      )}
      {onToggleRecord && (
        <button
          onClick={onToggleRecord}
          title={isRecording ? "Stop recording" : "Record clip"}
          style={btnStyle(isRecording)}
        >
          💾
        </button>
      )}
      {onLeave && (
        <button
          onClick={onLeave}
          title="Leave room"
          style={{ ...btnStyle(false), borderColor: "rgba(230,48,0,0.5)", color: "#E63000", background: "rgba(230,48,0,0.1)" }}
        >
          ❌
        </button>
      )}
    </div>
  );
}
