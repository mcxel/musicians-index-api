'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";

export default function StreamWinPage() {
  const router = useRouter();
  const [flowOpen, setFlowOpen] = useState(true);

  return (
    <main className="min-h-screen bg-[#050510]">
      {flowOpen && (
        <LobbyEntryFlow
          room={{
            id: 'stream-win-radio',
            title: 'Stream & Win Radio',
            subtitle: 'World Concert / Radio Stream',
            status: 'live',
            access: 'free',
            accentColor: '#FFD700',
            viewers: 3412,
            roomRoute: '/rooms/live-concert',
            venueIndex: 1,
          }}
          onClose={() => {
            setFlowOpen(false);
            router.push('/home/3');
          }}
        />
      )}
    </main>
  );
}
