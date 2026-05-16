"use client";

/**
 * CypherCeremonyTrigger
 * Client component for triggering winner ceremony inside the server-rendered cypher page.
 */

import { useState } from "react";
import WinnerCeremonyOverlay from "@/components/ceremony/WinnerCeremonyOverlay";

interface Props {
  winnerId?: string;
  winnerName?: string;
}

export default function CypherCeremonyTrigger({
  winnerId = "wavetek",
  winnerName = "Wavetek",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          padding: "10px 24px",
          background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.15em",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        👑 CEREMONY DEMO
      </button>

      {show && (
        <WinnerCeremonyOverlay
          battleId="monday-cypher-latest"
          context="cypher"
          winner={{
            userId: winnerId,
            displayName: winnerName,
            avatarUrl: "",
            score: 94,
            voteCount: 142,
          }}
          isUpset={false}
          rewardPoints={35}
          replayRoute="/cypher"
          onDismiss={() => setShow(false)}
        />
      )}
    </>
  );
}
