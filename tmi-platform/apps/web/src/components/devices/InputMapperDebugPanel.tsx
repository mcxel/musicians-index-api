"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { inputControlMapper } from "@/lib/devices/InputControlMapper";
import type { InputEvent } from "@/lib/devices/InputControlMapper";
import type { DeviceClass } from "@/lib/devices/DeviceCapabilityRegistry";

interface Props {
  deviceClass?: DeviceClass;
  maxEvents?: number;
  className?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  keyboard:   "#22d3ee",
  "tv-remote": "#f97316",
  gamepad:    "#a855f7",
  touch:      "#34d399",
  mouse:      "#60a5fa",
  dpad:       "#f59e0b",
  voice:      "#f472b6",
  stylus:     "#818cf8",
};

export function InputMapperDebugPanel({
  deviceClass = "desktop",
  maxEvents = 20,
  className = "",
}: Props) {
  const [events, setEvents] = useState<InputEvent[]>([]);
  const [bindings, setBindings] = useState(inputControlMapper.getKeyboardBindings());
  const [debugInfo, setDebugInfo] = useState(inputControlMapper.getDebugInfo());
  const [activeTab, setActiveTab] = useState<"live" | "bindings" | "info">("live");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputControlMapper.setDevice(deviceClass);
    inputControlMapper.attachListeners(deviceClass);
    setBindings(inputControlMapper.getKeyboardBindings());
    setDebugInfo(inputControlMapper.getDebugInfo());

    const unsub = inputControlMapper.onInput((ev) => {
      setEvents((prev) => [ev, ...prev].slice(0, maxEvents));
    });

    // Gamepad poll at 60fps
    pollRef.current = setInterval(() => {
      const gpEvents = inputControlMapper.pollGamepad();
      if (gpEvents.length > 0) {
        setEvents((prev) => [...gpEvents, ...prev].slice(0, maxEvents));
      }
    }, 16);

    return () => {
      unsub();
      inputControlMapper.detachListeners();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [deviceClass, maxEvents]);

  const clearEvents = useCallback(() => setEvents([]), []);

  const formatTs = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#050510] text-white ${className}`}
      style={{ fontFamily: "monospace", fontSize: 11 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-bold text-cyan-400">Input Mapper Debug</span>
        <span className="text-[10px] text-white/30">{deviceClass}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["live", "bindings", "info"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-[10px] capitalize ${
              activeTab === tab
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Live events */}
      {activeTab === "live" && (
        <div>
          <div className="flex items-center justify-between px-4 py-1.5">
            <span className="text-[10px] text-white/30">{events.length} events</span>
            <button
              onClick={clearEvents}
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
          <div className="h-48 overflow-y-auto">
            {events.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-white/20">
                Waiting for input…
              </div>
            ) : (
              events.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-1 hover:bg-white/5"
                >
                  <span
                    className="w-14 shrink-0 rounded px-1 text-center text-[9px]"
                    style={{
                      backgroundColor: (SOURCE_COLORS[ev.source] ?? "#64748b") + "33",
                      color: SOURCE_COLORS[ev.source] ?? "#64748b",
                    }}
                  >
                    {ev.source}
                  </span>
                  <span className="flex-1 text-[10px] text-white/80">{ev.action}</span>
                  {ev.rawKey && (
                    <span className="text-[9px] text-white/30">[{ev.rawKey}]</span>
                  )}
                  {ev.rawButton !== undefined && (
                    <span className="text-[9px] text-white/30">[btn:{ev.rawButton}]</span>
                  )}
                  <span className="shrink-0 text-[9px] text-white/20">{formatTs(ev.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Keyboard bindings */}
      {activeTab === "bindings" && (
        <div className="h-64 overflow-y-auto">
          {bindings.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-1"
            >
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/70">
                {b.ctrlKey ? "Ctrl+" : ""}
                {b.shiftKey ? "Shift+" : ""}
                {b.altKey ? "Alt+" : ""}
                {b.key === " " ? "Space" : b.key}
              </kbd>
              <span className="flex-1 text-[10px] text-cyan-400/80">{b.action}</span>
              <span className="text-[9px] text-white/30">{b.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Debug info */}
      {activeTab === "info" && (
        <div className="space-y-2 p-4">
          {Object.entries(debugInfo).map(([k, v]) => (
            <div key={k} className="flex justify-between text-[10px]">
              <span className="text-white/40">{k}</span>
              <span className="text-white/80">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InputMapperDebugPanel;
