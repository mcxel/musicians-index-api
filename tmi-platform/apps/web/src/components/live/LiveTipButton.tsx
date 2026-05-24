"use client";

type LiveTipButtonProps = {
  amount: number;
  onTip: (amount: number) => void;
};

export default function LiveTipButton({ amount, onTip }: LiveTipButtonProps) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <button
        onClick={() => onTip(amount)}
        style={{
          borderRadius: 8,
          border: "1px solid #6effc7",
          background: "#164634",
          color: "#b3ffe0",
          padding: "6px 9px",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        +${amount}
      </button>
      {amount === 1 && (
        <span style={{ fontSize: 9, color: "#888", whiteSpace: "nowrap" }}>⚡ Instant payout</span>
      )}
    </div>
  );
}
