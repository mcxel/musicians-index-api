"use client";

type LiveTipButtonProps = {
  amount: number;
  onTip: (amount: number) => void;
};

export default function LiveTipButton({ amount, onTip }: LiveTipButtonProps) {
  return (
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
  );
}
