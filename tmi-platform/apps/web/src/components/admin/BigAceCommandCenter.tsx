"use client";

import { useMemo, useState } from "react";
import BigAceFinancePanel from "@/components/admin/BigAceFinancePanel";
import { dispatchBotTask, evaluateGovernanceAction, getAuthorityAuditLog } from "@/lib/bots/bigAceAuthorityEngine";
import { logComplianceAction } from "@/lib/legal/complianceGuard";
import { getModerationLog, moderateSignal } from "@/lib/moderation/botModerationEngine";
import { DEFAULT_MONITOR_FEEDS, getFeedAccessLog, getFeedPrivacyState, requestFeedAccess } from "@/lib/privacy/liveFeedPrivacyEngine";
import { emitSystemEvent } from "@/lib/systemEventBus";

const PANELS = [
  "System Brain Map",
  "Bot Dispatch Grid",
  "Task + Goal Queue",
  "Route/Error Sentinel",
  "Live Feed Monitor Wall",
  "Homepage Rotation Monitor",
  "Moderation Radar",
  "Gift/Reward Approval Queue",
  "Build Patch Suggestions",
  "Compliance + Privacy Guard",
  "Simulation Sandbox",
  "MC Communication Channel",
];

export default function BigAceCommandCenter() {
  const [lastDispatch, setLastDispatch] = useState("No bot task dispatched yet.");
  const [lastModeration, setLastModeration] = useState("No moderation escalation yet.");
  const [feedMessage, setFeedMessage] = useState("No feed access attempts yet.");

  const dispatchTestBot = () => {
    const dispatched = dispatchBotTask("route-health-scan", "big-ace");
    setLastDispatch(dispatched.decision.reason);

    emitSystemEvent({
      type: "admin.monitor.open",
      actor: "Big Ace",
      sectionId: "bot-dispatch-grid",
      route: "/admin/big-ace",
      message: `Big Ace dispatched test bot task: ${dispatched.action.target}`,
      eventName: "bigAceDispatch",
    });
  };

  const simulateUnauthorizedApproval = () => {
    const decision = evaluateGovernanceAction({
      id: `blocked-${Date.now()}`,
      type: "policy.override",
      actor: "big-ace",
      target: "root-approval",
      risk: "critical",
      policyOverrideRequested: true,
    });

    setLastDispatch(decision.reason);

    logComplianceAction({
      id: `compliance-${Date.now()}`,
      actor: "big-ace",
      category: "legal",
      description: "Attempted to override root final authority",
      finalDecisionRequested: true,
    });
  };

  const openPublicFeed = () => {
    const feed = DEFAULT_MONITOR_FEEDS[0];
    const decision = requestFeedAccess(feed, { feedId: feed.id, actor: "big-ace" });
    setFeedMessage(`${feed.title}: ${decision.state} (${decision.reason})`);
  };

  const openPrivateFeed = () => {
    const feed = DEFAULT_MONITOR_FEEDS.find((item) => item.id === "private-rehearsal") ?? DEFAULT_MONITOR_FEEDS[0];
    const decision = requestFeedAccess(feed, { feedId: feed.id, actor: "big-ace" });
    setFeedMessage(`${feed.title}: ${decision.state} (${decision.reason})`);
  };

  const runModerationSimulation = () => {
    const event = moderateSignal("live-comment", "Fake admin scam payout exploit in chat");
    setLastModeration(`${event.eventType} escalated to ${event.escalatedTo.join(", ")}`);
  };

  const feedCards = useMemo(
    () => DEFAULT_MONITOR_FEEDS.map((feed) => ({ ...feed, state: getFeedPrivacyState(feed) })),
    [],
  );

  const authorityLog = useMemo(() => getAuthorityAuditLog().slice(0, 6), [lastDispatch]);
  const feedLog = useMemo(() => getFeedAccessLog().slice(0, 8), [feedMessage]);
  const moderationLog = useMemo(() => getModerationLog().slice(0, 6), [lastModeration]);

  return (
    <main
      data-testid="big-ace-command-center"
      style={{
        minHeight: "100vh",
        padding: 16,
        color: "#e2e8f0",
        background:
          "radial-gradient(circle at 12% 0%, rgba(56,189,248,0.17), transparent 35%), radial-gradient(circle at 88% 0%, rgba(250,204,21,0.15), transparent 30%), #020617",
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <h1 data-testid="big-ace-title" style={{ margin: 0, color: "#fcd34d", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 18 }}>
          Big Ace Administration Command Center
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#93c5fd" }}>
          Privacy-safe bot command deck with Marcel/root final governance lock.
        </p>
      </header>

      <section data-testid="big-ace-panels" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
        {PANELS.map((panel) => (
          <article key={panel} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, padding: 10, background: "rgba(15,23,42,0.65)" }}>
            <strong style={{ fontSize: 11, color: "#bfdbfe", letterSpacing: "0.06em", textTransform: "uppercase" }}>{panel}</strong>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginTop: 12 }}>
        <article style={{ border: "1px solid rgba(251,191,36,0.4)", borderRadius: 12, padding: 10 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 13, color: "#fde68a" }}>Bot Dispatch + Approval Chain</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button data-testid="big-ace-dispatch-test-bot" type="button" onClick={dispatchTestBot}>Dispatch Test Bot Task</button>
            <button data-testid="big-ace-unauthorized-override" type="button" onClick={simulateUnauthorizedApproval}>Attempt Unauthorized Override</button>
            <button data-testid="big-ace-run-moderation-sim" type="button" onClick={runModerationSimulation}>Run Moderation Simulation</button>
          </div>
          <p data-testid="big-ace-dispatch-status" style={{ marginTop: 8, fontSize: 12, color: "#7dd3fc" }}>{lastDispatch}</p>
          <p data-testid="big-ace-moderation-status" style={{ marginTop: 4, fontSize: 12, color: "#86efac" }}>{lastModeration}</p>
        </article>

        <article style={{ border: "1px solid rgba(34,197,94,0.4)", borderRadius: 12, padding: 10 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 13, color: "#86efac" }}>Live Feed Privacy Guard</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button data-testid="big-ace-open-public-feed" type="button" onClick={openPublicFeed}>Open Public Feed</button>
            <button data-testid="big-ace-open-private-feed" type="button" onClick={openPrivateFeed}>Open Private Feed</button>
          </div>
          <p data-testid="big-ace-feed-status" style={{ marginTop: 8, fontSize: 12, color: "#bbf7d0" }}>{feedMessage}</p>
          <div data-testid="big-ace-feed-cards" style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {feedCards.map((feed) => (
              <div key={feed.id} data-testid={`feed-state-${feed.id}`} style={{ border: "1px solid rgba(100,116,139,0.4)", borderRadius: 8, padding: 7 }}>
                <div style={{ fontSize: 11, color: "#e2e8f0" }}>{feed.title}</div>
                <div style={{ fontSize: 10, color: "#fca5a5" }}>{feed.state}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 12 }}>
        <article data-testid="big-ace-authority-log" style={{ border: "1px solid rgba(125,211,252,0.35)", borderRadius: 10, padding: 8 }}>
          <strong style={{ fontSize: 11, color: "#7dd3fc" }}>Authority Action Log</strong>
          <pre style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 10 }}>{JSON.stringify(authorityLog, null, 2)}</pre>
        </article>

        <article data-testid="big-ace-feed-access-log" style={{ border: "1px solid rgba(74,222,128,0.35)", borderRadius: 10, padding: 8 }}>
          <strong style={{ fontSize: 11, color: "#86efac" }}>Feed Access Log</strong>
          <pre style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 10 }}>{JSON.stringify(feedLog, null, 2)}</pre>
        </article>

        <article data-testid="big-ace-moderation-log" style={{ border: "1px solid rgba(252,165,165,0.35)", borderRadius: 10, padding: 8 }}>
          <strong style={{ fontSize: 11, color: "#fca5a5" }}>Moderation Event Log</strong>
          <pre style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 10 }}>{JSON.stringify(moderationLog, null, 2)}</pre>
        </article>
      </section>

      <section style={{ marginTop: 12 }}>
        <BigAceFinancePanel />
      </section>
    </main>
  );
}
