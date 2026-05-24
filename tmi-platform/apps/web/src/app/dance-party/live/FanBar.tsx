'use client';
import { useRouter } from 'next/navigation';

const ROOM_ID = 'dance-party-live';

export default function DancePartyFanBar() {
  const router = useRouter();

  function fanAction(label: string, color: string) {
    if (label === 'TIP') {
      router.push(`/api/stripe/checkout?priceId=price_tip_100&mode=payment&type=tip&roomId=${ROOM_ID}`);
      return;
    }
    if (label === 'CHAT') {
      document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
      return;
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(5,5,16,0.95)", borderTop: "1px solid rgba(0,255,255,0.2)", padding: "10px 20px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", zIndex: 100 }}>
      {([
        { label: "TIP", color: "#00FF88" },
        { label: "CLAP", color: "#FFD700" },
        { label: "LOVE", color: "#FF2DAA" },
        { label: "HYPE", color: "#AA2DFF" },
        { label: "CHAT", color: "#00FFFF" },
        { label: "VOTE", color: "#FF9500" },
        { label: "SAVE", color: "#fff" },
      ] as const).map(({ label, color }) => (
        <button
          key={label}
          onClick={() => fanAction(label, color)}
          style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color, border: `1px solid ${color}40`, borderRadius: 20, background: `${color}10`, cursor: "pointer" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
