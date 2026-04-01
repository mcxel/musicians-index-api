"use client";

export default function PlatformErrorShell({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 40,
      }}
    >
      <h1 style={{ fontSize: 28, color: "#0ff", marginBottom: 20 }}>
        Platform Error
      </h1>

      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 10,
          maxWidth: 600,
          marginBottom: 20,
        }}
      >
        <pre style={{ color: "#f66" }}>{error.message}</pre>
      </div>

      <button
        onClick={reset}
        style={{
          background: "#0ff",
          color: "#111",
          border: "none",
          padding: "10px 20px",
          borderRadius: 6,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
