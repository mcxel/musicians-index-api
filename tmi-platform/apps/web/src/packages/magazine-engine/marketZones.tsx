"use client";

import React from "react";
import SponsorSpotlightFrame from "@/packages/foundation-visual/SponsorSpotlightFrame";
import AngledPanel from "@/packages/foundation-visual/AngledPanel";
import BillboardFrame from "@/packages/foundation-visual/BillboardFrame";

export function SponsorSpotlightZone() {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <SponsorSpotlightFrame 
        brandName="Marketplace Pro" 
        message="Sponsor top artists and reserve premium digital real estate across live arenas." 
      />
    </div>
  );
}

export function AdMarketplaceZone() {
  return (
    <BillboardFrame sponsorTag="TMI ADS" className="h-full p-6">
      <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Ad Inventory</h2>
      <div className="space-y-3">
        <div className="bg-white/5 border border-white/10 p-3 rounded flex justify-between"><span className="text-zinc-300 text-sm">Main Stage Banner</span><span className="text-green-400 font-bold">AVAILABLE</span></div>
        <div className="bg-white/5 border border-white/10 p-3 rounded flex justify-between"><span className="text-zinc-300 text-sm">Magazine Cover Slab</span><span className="text-red-500 font-bold">SOLD OUT</span></div>
      </div>
    </BillboardFrame>
  );
}

export function AnalyticsDashZone() {
  return (
    <div className="w-full h-full flex flex-col gap-6">
      <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest">Platform ROI</h2>
      <AngledPanel className="border-l-cyan-500">
        <p className="text-xs text-zinc-400 tracking-widest uppercase">Live Viewers</p>
        <p className="text-4xl font-black text-white mt-1">1.2M</p>
      </AngledPanel>
    </div>
  );
}