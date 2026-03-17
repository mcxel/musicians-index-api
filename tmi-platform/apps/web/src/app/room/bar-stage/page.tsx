"use client";

import React, { useEffect, useState } from "react";
import { PlayerWidget } from "../../../components/PlayerWidget";
import { AudienceLayout } from "../../../components/AudienceLayout";
import { RoomStage } from "../../../components/RoomStage";
import { TipButtons } from "../../../components/TipButtons";
import { ReactionSet } from "../../../components/ReactionSet";
import { PropSlot } from "../../../components/PropSlot";
import { ChatBubbleArea } from "../../../components/ChatBubbleArea";
import { CompactLoadout } from "../../../components/CompactLoadout";
import { TipEffect } from "../../../components/TipEffect";
import { RecapCard } from "../../../components/RecapCard";
import { ShareCard } from "../../../components/ShareCard";

export default function BarStageRoom() {
  const [preview, setPreview] = useState<any>(null);
  const [propOn, setPropOn] = useState(false);
  const [loadout, setLoadout] = useState<any>(null);
  const [health, setHealth] = useState<'healthy'|'degraded'|'safe-mode'>('healthy');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('previewAvatar');
      if (raw) setPreview(JSON.parse(raw));
    } catch (e) {
      // ignore
    }

    function onLoadout(e: any) {
      setLoadout(e.detail || null);
      setPropOn(Boolean(e.detail?.prop));
    }

    function onHealth(e: any) {
      const h = e?.detail?.health || 'healthy';
      setHealth(h);
      // if safe-mode, disable prop on stage
      if (h === 'safe-mode') setPropOn(false);
    }

    // read current loadout
    try {
      const lRaw = sessionStorage.getItem('bb_loadout_v1');
      if (lRaw) {
        const parsed = JSON.parse(lRaw);
        setLoadout(parsed);
        setPropOn(Boolean(parsed?.prop));
      }
    } catch (e) {}

    window.addEventListener('bb:loadout:changed', onLoadout as EventListener);
    window.addEventListener('bb:room:health:changed', onHealth as EventListener);
    return () => {
      window.removeEventListener('bb:loadout:changed', onLoadout as EventListener);
      window.removeEventListener('bb:room:health:changed', onHealth as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bar Stage — Demo Room</h1>
          <div className="text-sm text-gray-300">Live room vertical slice</div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <PlayerWidget title="Live Stage Feed" />
            <RoomStage propOn={propOn} equippedProp={loadout?.prop} health={health} />
            <div className="flex items-center gap-3">
              <ReactionSet equippedEmote={loadout?.emote} disabled={health !== 'healthy'} />
              <PropSlot active={propOn} equippedName={loadout?.prop} onToggle={() => setPropOn((s) => !s)} disabled={health === 'safe-mode'} />
              <TipButtons disabled={health === 'safe-mode'} />
            </div>
            <ChatBubbleArea />
          </div>

          <aside className="space-y-4">
            <CompactLoadout />
            <RecapCard room={'Bar Stage'} />
            <ShareCard room={'Bar Stage'} route={'/room/bar-stage'} />
            <AudienceLayout preview={preview} />
            <div className="bg-gray-900 p-3 rounded text-sm">
              <div className="font-semibold mb-1">Previewed Avatar</div>
              <div className="text-gray-300">{preview ? JSON.stringify(preview) : 'No preview loaded'}</div>
            </div>
          </aside>
        </section>
        <TipEffect />
      </div>
    </div>
  );
}
