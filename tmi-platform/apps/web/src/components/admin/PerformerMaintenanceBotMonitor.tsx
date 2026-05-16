"use client";

import { useMemo, useState } from "react";
import BlankPerformerSeat from "@/components/lobby/BlankPerformerSeat";
import {
  getBlankSeatBots,
  getBlankSeatActionLog,
} from "@/lib/bots/blankSeatPerformerBots";
import {
  runFullPublicLobbyInspection,
  getLobbyInspectionByBot,
} from "@/lib/bots/publicLobbyMaintenanceEngine";

export default function PerformerMaintenanceBotMonitor() {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(getBlankSeatBots()[0]?.id ?? null);
  const [refreshKey, setRefreshKey] = useState(0);
  const bots = useMemo(() => getBlankSeatBots(), [refreshKey]);
  const selectedBot = bots.find((b) => b.id === selectedBotId) ?? null;
  const selectedInspection = selectedBot ? getLobbyInspectionByBot(selectedBot.id) : null;
  const logs = useMemo(
    () => (selectedBot ? getBlankSeatActionLog().filter((l) => l.botId === selectedBot.id).slice(-20).reverse() : []),
    [selectedBot, refreshKey]
  );

  return (
    <section data-testid="performer-maintenance-bot-monitor" style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, color: "#67e8f9", fontSize: 16 }}>Performer Maintenance Bot Monitor</h2>
        <button
          data-testid="run-maintenance-inspection"
          type="button"
          onClick={() => {
            const bot = selectedBot ?? bots[0];
            if (!bot) return;
            runFullPublicLobbyInspection(bot.id, "main-lobby", "/lobby");
            setRefreshKey((k) => k + 1);
          }}
          style={{
            border: "1px solid rgba(56,189,248,0.6)",
            background: "rgba(14,116,144,0.2)",
            color: "#e0f2fe",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Run Full Inspection
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {bots.map((bot) => (
            <BlankPerformerSeat key={bot.id} bot={bot} onClick={setSelectedBotId} />
          ))}
        </div>

        <article
          data-testid="selected-maintenance-bot-details"
          style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 12, background: "#0f172a", padding: 12 }}
        >
          {!selectedBot ? (
            <p style={{ color: "#94a3b8", margin: 0 }}>Click a blank seat bot to view route/task/feed telemetry.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 14 }}>{selectedBot.label}</h3>
              <div data-testid="maintenance-current-route" style={{ fontSize: 12, color: "#cbd5e1" }}>Route: {selectedBot.currentRoute}</div>
              <div data-testid="maintenance-current-task" style={{ fontSize: 12, color: "#cbd5e1" }}>Task: {selectedBot.currentTask}</div>
              <div data-testid="maintenance-feed-health" style={{ fontSize: 12, color: "#cbd5e1" }}>
                Feed Health - V:{selectedBot.feedHealth.video} A:{selectedBot.feedHealth.audio} C:{selectedBot.feedHealth.chat}
              </div>
              <div data-testid="maintenance-sandbox-wallet" style={{ fontSize: 12, color: "#fde68a" }}>
                Wallet: {selectedBot.sandboxWallet.mode} / payouts={String(selectedBot.sandboxWallet.payoutsEnabled)}
              </div>

              <div data-testid="maintenance-inspection-status" style={{ fontSize: 12, color: "#93c5fd" }}>
                Inspection Step: {selectedInspection?.currentStep ?? "none"}
              </div>

              <div data-testid="maintenance-error-log" style={{ display: "grid", gap: 6, maxHeight: 180, overflow: "auto" }}>
                {logs.length === 0 ? (
                  <span style={{ color: "#64748b", fontSize: 12 }}>No log entries yet.</span>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} style={{ fontSize: 11, color: log.blocked ? "#fca5a5" : "#cbd5e1" }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.action} {log.blocked ? `BLOCKED (${log.reason})` : "OK"}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
