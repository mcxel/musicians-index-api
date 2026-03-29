import React from "react";

const Refunds = () => {
  return (
    <div style={{ padding: 12, maxWidth: 320 }}>
      <h3 style={{ margin: 0 }}>Refunds Control</h3>
      <p style={{ marginTop: 8, marginBottom: 12, color: "#cbd5e1" }}>
        Open the Refund Control Room to review and process refund batches.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            window.location.href = "/admin/refunds";
          }}
          style={{
            background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
            color: "white",
            border: 0,
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Open Refunds
        </button>
        <button
          onClick={() => {
            window.open("/admin/refunds", "_blank");
          }}
          style={{
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid rgba(148,163,184,0.12)",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          New Window
        </button>
      </div>
    </div>
  );
};

export default Refunds;
