"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RewardNotification from "@/components/rewards/RewardNotification";
import { spendPoints } from "@/lib/economy/PointSpendEngine";
import { getPointBalance, addPoints } from "@/lib/economy/PointWalletEngine";
import { pushPointHistory } from "@/lib/economy/PointHistoryEngine";

type Props = {
  userId: string;
  rewardPoints: number;
  rewardReason: string;
  rewardAwarded: boolean;
};

export default function MagazineLoopClient({ userId, rewardPoints, rewardReason, rewardAwarded }: Props) {
  const [showReward, setShowReward] = useState(false);
  const [balance, setBalance] = useState(0);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = getPointBalance(userId);
    if (rewardAwarded && rewardPoints > 0) {
      addPoints(userId, rewardPoints);
      pushPointHistory(userId, rewardPoints, "magazine-read-reward");
      setShowReward(true);
      setBalance(getPointBalance(userId));
      return;
    }
    setBalance(current);
  }, [userId, rewardAwarded, rewardPoints]);

  const spendForRoomJoin = () => {
    const cost = 15;
    const result = spendPoints(userId, cost);
    if (!result.ok) {
      setJoinMessage("Not enough points to auto-join room.");
      return;
    }

    pushPointHistory(userId, -cost, "room-entry-pass");
    setBalance(result.balance);
    setJoinMessage("Room pass unlocked. Continue to lobby or room.");
  };

  return (
    <div style={{ marginTop: 14 }}>
      <RewardNotification
        show={showReward}
        points={rewardPoints}
        reason={rewardReason}
        onDismiss={() => setShowReward(false)}
      />

      <div style={{ border: "1px solid rgba(0,255,255,0.26)", borderRadius: 10, padding: "10px 12px", background: "rgba(0,255,255,0.05)" }}>
        <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 6 }}>POINTS LOOP</div>
        <div style={{ fontSize: 12, color: "#fff", marginBottom: 8 }}>Wallet: {balance} points</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={spendForRoomJoin} style={{ border: "1px solid rgba(255,215,0,0.45)", background: "rgba(255,215,0,0.08)", color: "#FFD700", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Spend 15 to Join Room
          </button>
          <Link href="/live/lobby" style={{ color: "#00FF88", fontSize: 11, textDecoration: "none" }}>Go To Lobby</Link>
          <Link href="/wallet" style={{ color: "#AA2DFF", fontSize: 11, textDecoration: "none" }}>Open Wallet</Link>
        </div>
        {joinMessage && <div style={{ marginTop: 8, fontSize: 11, color: "#fff" }}>{joinMessage}</div>}
      </div>
    </div>
  );
}
