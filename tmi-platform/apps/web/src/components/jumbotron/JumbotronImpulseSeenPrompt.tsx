"use client";

/**
 * JumbotronImpulseSeenPrompt.tsx
 *
 * TMI Fan "You Want to Be Seen?" Jumbotron Impulse Flow Component
 *
 * Master Laws:
 * 1. Flat-rate $3.99 impulse pricing per 15-second spotlight.
 * 2. Back-to-back accumulation: 1..6 slots.
 * 3. Automated Bulk Upgrade: 5+ slots unlocks Sparkle Glitter Tier.
 * 4. Performer revenue split: 70% goes to the performer on verified delivery.
 * 5. Jumbotron Delivery Guarantee: Full delivery or 100% credited / refundable.
 */

import React, { useState } from "react";
import {
  JumbotronImpulseSeenNetwork,
  IMPULSE_SEEN_FLAT_RATE_CENTS,
  BULK_UPGRADE_MIN_SLOTS,
} from "@/lib/jumbotron/JumbotronImpulseSeenNetwork";

interface JumbotronImpulseSeenPromptProps {
  roomId: string;
  venueId: string;
  performerId: string;
  participantId: string;
  participantName: string;
  className?: string;
}

export function JumbotronImpulseSeenPrompt({
  roomId,
  venueId,
  performerId,
  participantId,
  participantName,
  className = "",
}: JumbotronImpulseSeenPromptProps) {
  const [network] = useState(() => new JumbotronImpulseSeenNetwork());
  const [isOpen, setIsOpen] = useState(false);
  const [slotsCount, setSlotsCount] = useState(1);
  const [bookedAlert, setBookedAlert] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const promptConfig = network.getPromptConfig();
  const isSparkleTier = slotsCount >= BULK_UPGRADE_MIN_SLOTS;
  const totalCostUsd = ((slotsCount * IMPULSE_SEEN_FLAT_RATE_CENTS) / 100).toFixed(2);
  const totalSeconds = slotsCount * 15;

  const handleBook = () => {
    const order = network.createImpulseOrder({
      participantId,
      participantName,
      roomId,
      venueId,
      performerId,
      slotsCount,
      paymentReference: `pm_seen_${Date.now()}`,
    });

    setActiveOrderId(order.orderId);
    setBookedAlert(order.viralShareAlert);
  };

  const handleCopyAlert = () => {
    if (!bookedAlert) return;
    navigator.clipboard?.writeText?.(bookedAlert);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative inline-block ${className}`} data-testid="jumbotron-impulse-seen-container">
      {/* Non-intrusive prompt button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-fuchsia-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-400/40 shadow-lg shadow-amber-500/10 transition-all active:scale-95"
        data-testid="impulse-seen-prompt-trigger"
        aria-label="You want to be seen on the Jumbotron?"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-xs font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
          You want to be seen?
        </span>
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-400 text-black">
          $3.99 · 15s
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          data-testid="impulse-seen-modal"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-amber-500/40 p-6 shadow-2xl shadow-amber-500/20 text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            {!bookedAlert ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xl">
                    📺
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-amber-300">
                      {promptConfig.title}
                    </h3>
                    <p className="text-xs text-zinc-400">{promptConfig.subline}</p>
                  </div>
                </div>

                {/* Slot quantity selector */}
                <div className="mb-5 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-zinc-300">Consecutive Slots:</span>
                    <span className="text-sm font-black text-cyan-400">
                      {slotsCount} {slotsCount === 1 ? "Slot" : "Slots"} ({totalSeconds}s Screen Time)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSlotsCount(num)}
                        className={`flex-1 py-2 text-xs font-black rounded-lg border transition-all ${
                          slotsCount === num
                            ? "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                        }`}
                        data-testid={`slot-select-${num}`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>

                  {/* Sparkle Bulk Upgrade Announcement */}
                  {isSparkleTier ? (
                    <div
                      className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 border border-amber-400/50 flex items-center gap-2 text-xs font-bold text-amber-300 animate-pulse"
                      data-testid="sparkle-glitter-banner"
                    >
                      <span>✨</span>
                      <span>EXCLUSIVE SPARKLE GLITTER TIER UNLOCKED! (5+ Slots Reward)</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-zinc-400">
                      💡 Tip: Buy 5+ slots to automatically unlock the exclusive Sparkle Glitter Tier!
                    </p>
                  )}
                </div>

                {/* Breakdown & Performer Revenue Notice */}
                <div className="space-y-2 text-xs mb-5">
                  <div className="flex justify-between text-zinc-300">
                    <span>Spotlight Rate:</span>
                    <span>$3.99 / 15s</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Performer Support:</span>
                    <span className="text-emerald-400 font-bold">70% directly pays performer</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white border-t border-zinc-800 pt-2">
                    <span>Total Amount:</span>
                    <span className="text-amber-400 text-base font-black">${totalCostUsd}</span>
                  </div>
                </div>

                {/* Delivery Guarantee Policy */}
                <div className="p-3 mb-5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200">
                  <span className="font-bold">🛡️ Jumbotron Delivery Guarantee:</span> Paid revenue is earned only
                  after verified delivery. If the room disconnects or crashes, your full spotlight is 100% credited
                  or refundable.
                </div>

                {/* Action button */}
                <button
                  onClick={handleBook}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-black uppercase tracking-wider text-sm shadow-xl shadow-amber-500/30 transition-transform active:scale-95"
                  data-testid="lock-spot-button"
                >
                  Lock Spotlight Slot (${totalCostUsd})
                </button>
              </>
            ) : (
              /* Success confirmation state */
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl text-emerald-400">
                  ✓
                </div>
                <h3 className="text-lg font-black uppercase text-amber-300 mb-1">
                  Spotlight Scheduled!
                </h3>
                <p className="text-xs text-zinc-300 mb-4">
                  Your avatar is queued on the East Jumbotron Face.
                </p>

                {/* Viral share alert box */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Shareable Invitation Alert:
                  </span>
                  <p className="text-xs font-medium text-amber-200" data-testid="viral-alert-text">
                    {bookedAlert}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyAlert}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase transition-all"
                    data-testid="copy-alert-button"
                  >
                    {copied ? "Copied to Clipboard!" : "Copy Share Message"}
                  </button>
                  <button
                    onClick={() => {
                      setBookedAlert(null);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
