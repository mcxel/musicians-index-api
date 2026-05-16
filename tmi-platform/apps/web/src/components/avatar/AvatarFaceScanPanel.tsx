"use client";

interface AvatarFaceScanPanelProps {
  scanActive: boolean;
  setScanActive: (active: boolean) => void;
}

export default function AvatarFaceScanPanel({ scanActive, setScanActive }: AvatarFaceScanPanelProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `2px solid ${scanActive ? "#ff6b9d" : "#6a4b96"}`,
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes scanLines {
          0% { top: -100%; }
          100% { top: 100%; }
        }
        .face-scan-window {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .face-scan-window::after {
          content: '';
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 10px;
          background: linear-gradient(to bottom, transparent, rgba(255, 107, 157, 0.6));
          animation: ${scanActive ? "scanLines 2s linear infinite" : "none"};
        }
      `}</style>

      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Face Scan Capture Window
      </div>

      <div
        className="face-scan-window"
        style={{
          width: 160,
          height: 160,
          border: `2px solid ${scanActive ? "#ff6b9d" : "#6a4b96"}`,
          borderRadius: 8,
          background: scanActive ? "#3a1a2a" : "#1a1029",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 60,
          marginBottom: 16,
          boxShadow: scanActive ? "0 0 16px rgba(255, 107, 157, 0.4)" : "none",
        }}
      >
        📸
      </div>

      <div style={{ color: "#f3eaff", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        {scanActive ? "Scanning..." : "Ready to Scan"}
      </div>

      <button
        onClick={() => setScanActive(!scanActive)}
        style={{
          borderRadius: 8,
          border: `1px solid ${scanActive ? "#ff6b9d" : "#9f7dd6"}`,
          background: scanActive ? "#5a2a3a" : "#5a4525",
          color: scanActive ? "#ffb3c1" : "#f3eaff",
          padding: "10px 16px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 12,
          transition: "all 0.2s",
        }}
      >
        {scanActive ? "Stop Scan" : "Start Scan"}
      </button>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #6a4b96",
          background: "#1a1029",
          padding: 8,
          fontSize: 10,
          color: "#c8b5e5",
          textAlign: "center",
          width: "100%",
        }}
      >
        Facial recognition for profile matching
      </div>
    </div>
  );
}
