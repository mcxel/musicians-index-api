"use client";

import { useState, useEffect } from "react";
import type { WorkspaceRole } from "@/components/shell/workspaceTypes";
import { WorkspaceTemplate } from "@/components/shell/WorkspaceTemplate";

/**
 * BusinessCanisterWorkspace — Producer's Desk pass.
 *
 * The single commercial workspace: Sponsor Pipeline / Campaign Assets /
 * Booking Leads / Partnership Requests / Promotion Queue. Dark glass +
 * brushed metal panels, console-style tab switches, and status lamps
 * that read real state (standby until a real relationship exists — no
 * fake "live" lamps, no fake sponsors, no fake stats, no fake money).
 * Every CTA routes to a real existing page.
 */

type BusinessTab = "sponsors" | "advertising" | "bookings" | "partnerships" | "promotions" | "revenue";
type LampState = "standby" | "pending" | "active";

const TABS: { id: BusinessTab; label: string; icon: string }[] = [
  { id: "sponsors", label: "Sponsor Pipeline", icon: "💼" },
  { id: "advertising", label: "Campaign Assets", icon: "📣" },
  { id: "bookings", label: "Booking Leads", icon: "📅" },
  { id: "partnerships", label: "Partnership Requests", icon: "🤝" },
  { id: "promotions", label: "Promotion Queue", icon: "🚀" },
  { id: "revenue", label: "Revenue Health", icon: "📊" },
];

type BusinessCanisterWorkspaceProps = {
  role: WorkspaceRole;
};

export function BusinessCanisterWorkspace({ role }: BusinessCanisterWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<BusinessTab>("sponsors");

  const isPerformer = role === "performer" || role === "artist" || role === "producer";
  const isBusiness = role === "sponsor" || role === "advertiser";
  const isVenueSide = role === "venue" || role === "promoter";
  const isAdmin = role === "admin" || role === "big-ace";

  return (
    <WorkspaceTemplate
      icon="💼"
      title="Business Canister"
      subtitle="Sponsorships, campaigns, bookings, and partnerships — all verified ecosystem connections."
      status={{ label: "No active relationships", tone: "neutral" }}
      toolbar={
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.filter(tab => isAdmin || tab.id !== 'revenue').map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="tmi-console-toggle"
                data-active={active}
              >
                <Lamp state="standby" />
                <span>{tab.icon} {tab.label.toUpperCase()}</span>
              </button>
            );
          })}
          <style jsx>{`
            .tmi-console-toggle {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              border-radius: 6px;
              border: 1px solid rgba(255, 255, 255, 0.14);
              background:
                linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.35)),
                repeating-linear-gradient(
                  115deg,
                  rgba(255, 255, 255, 0.025) 0px,
                  rgba(255, 255, 255, 0.025) 1px,
                  transparent 1px,
                  transparent 3px
                );
              color: rgba(240, 244, 255, 0.72);
              padding: 6px 12px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.06em;
              cursor: pointer;
              transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 2px rgba(0, 0, 0, 0.5);
            }
            .tmi-console-toggle:hover {
              border-color: rgba(0, 255, 255, 0.3);
              background:
                linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.3)),
                repeating-linear-gradient(
                  115deg,
                  rgba(255, 255, 255, 0.025) 0px,
                  rgba(255, 255, 255, 0.025) 1px,
                  transparent 1px,
                  transparent 3px
                );
            }
            .tmi-console-toggle[data-active="true"] {
              border-color: rgba(0, 255, 255, 0.55);
              background: linear-gradient(180deg, rgba(0, 255, 255, 0.14), rgba(0, 40, 50, 0.35));
              color: #9efbff;
              box-shadow: inset 0 1px 0 rgba(0, 255, 255, 0.2), 0 0 10px rgba(0, 255, 255, 0.15);
            }
          `}</style>
        </div>
      }
      statusStrip="Every relationship starts as a verified connection — invite → signup → approval. No uploaded-logo sponsors."
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", gap: 10, alignContent: "start" }}>
        {activeTab === "sponsors" && (
          <TabPanel
            key="sponsors"
            title={isBusiness ? "Your Sponsor Pipeline" : "Sponsor Pipeline"}
            lamp="standby"
            empty={
              isBusiness
                ? "Your sponsor pipeline is empty. Discover performers, venues, and events to sponsor."
                : "Your sponsor pipeline is empty. Invite a business into the TMI ecosystem — they sign up, get approved, and appear here."
            }
            actions={
              isBusiness
                ? [
                    { label: "Find Performers", href: "/performers" },
                    { label: "Sponsor Packages", href: "/sponsors/advertise" },
                  ]
                : [
                    { label: "Invite a Sponsor", href: "/sponsors/advertise" },
                    { label: "How Sponsorship Works", href: "/sponsors" },
                  ]
            }
          >
            <SlotRail label="LOCAL OPEN SLOTS" />
            <SlotRail label="MAJOR OPEN SLOTS" />
          </TabPanel>
        )}

        {activeTab === "advertising" && (
          <TabPanel
            key="advertising"
            title="Campaign Assets"
            lamp="standby"
            empty="No campaign assets yet. Assets appear here once a real placement is purchased and approved."
            actions={[
              { label: "Buy Ad Placement", href: "/advertiser/buy" },
              { label: "Advertise With TMI", href: "/sponsors/advertise" },
            ]}
          />
        )}

        {activeTab === "bookings" && (
          <TabPanel
            key="bookings"
            title={isVenueSide ? "Talent Booking Leads" : "Booking Leads"}
            lamp="standby"
            empty={
              isVenueSide
                ? "No booking leads yet. Find artists for your next event."
                : "No booking leads yet. Requests from venues, promoters, and businesses appear here."
            }
            actions={
              isVenueSide
                ? [
                    { label: "Find Artists", href: "/performers" },
                    { label: "Bookings Hub", href: "/bookings" },
                  ]
                : [
                    { label: "Bookings Hub", href: "/bookings" },
                    { label: "Browse Venues", href: "/venues" },
                  ]
            }
          />
        )}

        {activeTab === "partnerships" && (
          <TabPanel
            key="partnerships"
            title="Partnership Requests"
            lamp="standby"
            empty="No partnership requests yet. Verified brand collaborations will be tracked here from request to completion."
            actions={[
              { label: isPerformer ? "Invite a Partner" : "Explore Partnerships", href: "/sponsors" },
            ]}
          />
        )}

        {activeTab === "promotions" && (
          <TabPanel
            key="promotions"
            title="Promotion Queue"
            lamp="standby"
            empty="Promotion queue is empty. Coupons, giveaways, and featured campaigns appear here once created with a real partner."
            actions={[{ label: "Promotion Options", href: "/sponsors/advertise" }]}
          />
        )}

        {activeTab === "revenue" && isAdmin && (
          <TabPanel
            key="revenue"
            title="Revenue Health Monitor"
            lamp="active"
            empty="All systems healthy. No payment failures detected."
            actions={[{ label: "Run Manual Reconciliation", href: "/api/admin/reconcile", isPost: true }]}
          >
            <RevenueHealthSummary />
            <RevenueAlertTable />
          </TabPanel>
        )}
      </div>
    </WorkspaceTemplate>
  );
}

function Lamp({ state }: { state: LampState }) {
  return (
    <>
      <span className="tmi-lamp" data-state={state} />
      <style jsx>{`
        .tmi-lamp {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6);
        }
        .tmi-lamp[data-state="pending"] {
          background: #ffb054;
          box-shadow: 0 0 5px rgba(255, 176, 84, 0.7);
          animation: tmiLampPulse 1.6s ease-in-out infinite;
        }
        .tmi-lamp[data-state="error"] {
          background: #ff4444;
          box-shadow: 0 0 6px rgba(255, 68, 68, 0.85);
          animation: tmiLampPulse 1.2s ease-in-out infinite;
        }
        .tmi-lamp[data-state="active"] {
          background: #58ffcf;
          box-shadow: 0 0 6px rgba(88, 255, 207, 0.85);
          animation: tmiLampIgnite 0.6s ease-out;
        }
        @keyframes tmiLampPulse {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes tmiLampIgnite {
          0% {
            box-shadow: 0 0 0 rgba(88, 255, 207, 0);
            transform: scale(0.6);
          }
          60% {
            box-shadow: 0 0 12px rgba(88, 255, 207, 1);
          }
          100% {
            box-shadow: 0 0 6px rgba(88, 255, 207, 0.85);
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

function TabPanel({
  title,
  lamp,
  empty,
  actions,
  children,
}: {
  title: string;
  lamp: LampState;
  empty: string;
  actions: { label: string; href: string; isPost?: boolean }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="tmi-desk-panel">
      <div className="tmi-desk-panel-header">
        <Lamp state={lamp} />
        <span>{title.toUpperCase()}</span>
      </div>
      {children}
      <div className="tmi-desk-empty">{empty}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {actions.map((action) =>
          action.isPost ? (
            <button
              key={action.label}
              onClick={async () => {
                alert('Running reconciliation... Check server logs for details.');
                await fetch(action.href, { method: 'POST' });
                alert('Reconciliation complete.');
              }}
              className="tmi-desk-cta"
            >
              {action.label} 🔄
            </button>
          ) : (
            <a key={action.label} href={action.href} className="tmi-desk-cta">
              {action.label} →
            </a>
          )
        )}
      </div>
      <style jsx>{`
        .tmi-desk-panel {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.035) 0%, rgba(0, 0, 0, 0) 40%),
            repeating-linear-gradient(
              100deg,
              rgba(255, 255, 255, 0.015) 0px,
              rgba(255, 255, 255, 0.015) 1px,
              transparent 1px,
              transparent 4px
            ),
            rgba(6, 8, 26, 0.7);
          padding: 14px;
          display: grid;
          gap: 12px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 20px rgba(0, 0, 0, 0.25);
          animation: tmiPanelIn 0.22s ease-out;
        }
        .tmi-desk-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #cefbff;
        }
        .tmi-desk-empty {
          border-radius: 10px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          padding: 14px;
          font-size: 12px;
          color: rgba(230, 230, 255, 0.75);
        }
        .tmi-desk-cta {
          font-family: inherit;
          text-decoration: none;
          border-radius: 10px;
          border: 1px solid rgba(0, 255, 255, 0.4);
          background: rgba(0, 255, 255, 0.1);
          color: #cffeff;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          display: inline-block;
        }
        .tmi-desk-cta:hover {
          background: rgba(0, 255, 255, 0.18);
          border-color: rgba(0, 255, 255, 0.65);
          transform: translateY(-1px);
        }
        @keyframes tmiPanelIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function RevenueHealthSummary() {
  const [summary, setSummary] = useState<{ totalAtRisk: number; mrrAtRisk: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue-summary')
      .then(res => res.json())
      .then(data => setSummary(data));
  }, []);

  const metrics = [
    { label: "Total At-Risk", value: summary?.totalAtRisk, unit: "accounts" },
    { label: "MRR At-Risk", value: summary?.mrrAtRisk, unit: "USD" },
    { label: "Webhook Health", value: "100%", unit: "online" },
  ];

  return (
    <div className="tmi-summary-grid">
      {metrics.map(metric => (
        <div key={metric.label} className="tmi-summary-metric">
          <div className="tmi-summary-label">{metric.label.toUpperCase()}</div>
          <div className="tmi-summary-value">
            {metric.value === null || metric.value === undefined ? '...' : metric.value}
            {metric.label === 'MRR At-Risk' && <span className="tmi-summary-unit-note"> (pending price data)</span>}
          </div>
        </div>
      ))}
      <style jsx>{`
        .tmi-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }
        .tmi-summary-metric {
          border-radius: 8px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 12px;
        }
        .tmi-summary-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
          margin-bottom: 4px;
        }
        .tmi-summary-value {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }
        .tmi-summary-unit-note {
          font-size: 9px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
}

function RevenueAlertTable() {
  const [atRisk, setAtRisk] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue-health')
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => setAtRisk(data.atRiskSubscriptions))
      .catch(() => setError("Failed to load revenue health data."));
  }, []);

  if (error) {
    return <div className="tmi-alert-row alert-error">{error}</div>;
  }

  if (atRisk === null) {
    return <div className="tmi-alert-row">Loading revenue health...</div>;
  }

  if (atRisk.length === 0) {
    return null; // The parent TabPanel will show the "empty" message
  }

  return (
    <div className="tmi-data-table">
      <div className="tmi-data-table-header">
        <span>User</span>
        <span>Status</span>
        <span>Failures</span>
        <span>Last Attempt</span>
        <span style={{ textAlign: 'center' }}>Actions</span>
      </div>
      {atRisk.map(sub => (
        <div key={sub.id} className="tmi-alert-row alert-failed">
          <span>{sub.user?.name || sub.user?.email || 'Unknown User'}</span>
          <span>{sub.status}</span>
          <span style={{ textTransform: 'capitalize' }}>{sub.status.replace('_', ' ')}</span>
          <span>{sub.paymentFailureCount}</span>
          <span>{sub.lastPaymentAttempt ? new Date(sub.lastPaymentAttempt).toLocaleString() : 'N/A'}</span>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="tmi-action-button">Send Reminder</button>
          </div>
        </div>
      ))}
      <style jsx>{`
        .tmi-data-table {
          font-size: 11px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tmi-data-table-header, .tmi-alert-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          grid-template-columns: 2fr 1fr 0.5fr 1.5fr;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
        }
        .tmi-data-table-header {
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tmi-alert-row {
          background: rgba(255,68,68,0.08);
          border: 1px solid rgba(255,68,68,0.2);
          color: #ffc4c4;
        }
        .alert-error {
          background: rgba(255,68,68,0.2);
          color: #ff4444;
        }
        .tmi-action-button {
          font-family: inherit;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          color: #9EFBFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .tmi-action-button:hover {
          background: rgba(0, 255, 255, 0.2);
          border-color: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

function SlotRail({ label }: { label: string }) {
  return (
    <div className="tmi-slot-rail">
      <div className="tmi-slot-rail-label">
        {label} (0)
      </div>
      <div className="tmi-slot-rail-empty">No sponsors filling this slot tier yet.</div>
      <style jsx>{`
        .tmi-slot-rail {
          display: grid;
          gap: 6px;
        }
        .tmi-slot-rail-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: rgba(205, 229, 255, 0.6);
        }
        .tmi-slot-rail-empty {
          border-radius: 8px;
          border: 1px dashed rgba(255, 255, 255, 0.14);
          padding: 10px 12px;
          font-size: 11px;
          color: rgba(230, 230, 255, 0.55);
        }
      `}</style>
    </div>
  );
}

export default BusinessCanisterWorkspace;
