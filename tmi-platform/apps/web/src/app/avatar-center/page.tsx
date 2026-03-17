import React from "react";
import { AvatarCreator } from "../../components/AvatarCreator";
import { PlayerWidget } from "../../components/PlayerWidget";

export default function AvatarCenterPage() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Avatar Creation Center</h1>
          <div className="text-sm text-gray-300">Bar stage demo / vertical slice</div>
        </header>

        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-200">Originality Sticky Note</p>
          <p className="mt-1 text-sm text-amber-100/90">
            Keep your preview original so your avatar style stands out and gets discovered more.
          </p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AvatarCreator />
          <div className="space-y-4">
            <PlayerWidget title="Preview Player" />
            <div className="bg-gray-900 p-4 rounded"> 
              <h3 className="font-semibold">Quick Links</h3>
              <div className="mt-2 flex gap-2">
                <a href="/room/bar-stage" className="px-3 py-2 bg-orange-500 rounded">Open Bar Stage</a>
                <a href="/inventory" className="px-3 py-2 bg-gray-700 rounded">My Inventory</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
