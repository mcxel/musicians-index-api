"use client";

import { useState } from "react";
import type { WorkspaceRole } from "@/components/shell/workspaceTypes";
import { WorkspaceTemplate } from "@/components/shell/WorkspaceTemplate";

/**
 * BusinessCanisterWorkspace — Pass 1 foundation.
 *
 * The single commercial workspace: Sponsors / Advertising / Bookings /
 * Partnerships / Promotions. UI + honest empty states only. No fake
 * sponsors, no fake stats, no fake money. Real relationships arrive via
 * the verified ecosystem flow (invite → signup → approval) in a later
 * backend pass; until then every tab reports its true empty state and
 * every CTA routes to a real existing page.
 */

type BusinessTab = "sponsors" | "advertising" | "bookings" | "partnerships" | "promotions";

const TABS: { id: BusinessTab; label: string; icon: string }[] = [
  { id: "sponsors", label: "Sponsors", icon: "💼" },
  { id: "advertising", label: "Advertising", icon: "📣" },
  { id: "bookings", label: "Bookings", icon: "📅" },
  { id: "partnerships", label: "Partnerships", icon: "🤝" },
  { id: "promotions", label: "Promotions", icon: "🚀" },
];

type BusinessCanisterWorkspaceProps = {
  role: WorkspaceRole;
};

export function BusinessCanisterWorkspace({ role }: BusinessCanisterWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<BusinessTab>("sponsors");

  const isPerformer = role === "performer" || role === "artist" || role === "producer";
  const isBusiness = role === "sponsor" || role === "advertiser";
  const isVenueSide = role === "venue" || role === "promoter";

  return (
    <WorkspaceTemplate
      icon="💼"
      title="Business Canister"
      subtitle="Sponsorships, campaigns, bookings, and partnerships — all verified ecosystem connections."
      status={{ label: "No active relationships", tone: "neutral" }}
      toolbar={
        <>
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  borderRadius: 999,
                  border: active ? "1px solid rgba(0,255,255,0.5)" : "1px solid rgba(255,255,255,0.14)",
                  background: active ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  color: active ? "#9EFBFF" : "rgba(240,244,255,0.72)",
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                {tab.icon} {tab.label.toUpperCase()}
              </button>
            );
          })}
        </>
      }
      statusStrip="Every relationship starts as a verified connection — invite → signup → approval. No uploaded-logo sponsors."
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", gap: 10, alignContent: "start" }}>
        {activeTab === "sponsors" && (
          <TabPanel
            title={isBusiness ? "Your Sponsorships" : "My Sponsors"}
            empty={
              isBusiness
                ? "You aren't sponsoring anyone yet. Discover performers, venues, and events to sponsor."
                : "No sponsors yet. Invite a business into the TMI ecosystem — they sign up, get approved, and appear here."
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
            <SlotRail label="LOCAL SPONSORS" />
            <SlotRail label="MAJOR SPONSORS" />
          </TabPanel>
        )}

        {activeTab === "advertising" && (
          <TabPanel
            title="Platform Campaigns"
            empty="No active ad campaigns. Campaigns appear here once a real placement is purchased and approved."
            actions={[
              { label: "Buy Ad Placement", href: "/advertiser/buy" },
              { label: "Advertise With TMI", href: "/sponsors/advertise" },
            ]}
          />
        )}

        {activeTab === "bookings" && (
          <TabPanel
            title={isVenueSide ? "Talent Booking" : "Booking Requests"}
            empty={
              isVenueSide
                ? "No booking requests yet. Find artists for your next event."
                : "No bookings yet. Requests from venues, promoters, and businesses appear here."
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
            title="Brand Partnerships"
            empty="No partnerships yet. Verified brand collaborations will be tracked here from request to completion."
            actions={[
              { label: isPerformer ? "Invite a Partner" : "Explore Partnerships", href: "/sponsors" },
            ]}
          />
        )}

        {activeTab === "promotions" && (
          <TabPanel
            title="Promotions & Featured Campaigns"
            empty="No promotions running. Coupons, giveaways, and featured campaigns appear here once created with a real partner."
            actions={[
              { label: "Promotion Options", href: "/sponsors/advertise" },
            ]}
          />
        )}
      </div>
    </WorkspaceTemplate>
  );
}

function TabPanel({
  title,
  empty,
  actions,
  children,
}: {
  title: string;
  empty: string;
  actions: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(6, 8, 26, 0.7)",
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#cefbff" }}>
        {title.toUpperCase()}
      </div>
      {children}
      <div
        style={{
          borderRadius: 10,
          border: "1px dashed rgba(255,255,255,0.2)",
          padding: 14,
          fontSize: 12,
          color: "rgba(230,230,255,0.75)",
        }}
      >
        {empty}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            style={{
              textDecoration: "none",
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.4)",
              background: "rgba(0,255,255,0.1)",
              color: "#cffeff",
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {action.label} →
          </a>
        ))}
      </div>
    </div>
  );
}

function SlotRail({ label }: { label: string }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(205,229,255,0.6)" }}>
        {label} (0)
      </div>
      <div
        style={{
          borderRadius: 8,
          border: "1px dashed rgba(255,255,255,0.14)",
          padding: "10px 12px",
          fontSize: 11,
          color: "rgba(230,230,255,0.55)",
        }}
      >
        No verified sponsors in this tier yet.
      </div>
    </div>
  );
}

export default BusinessCanisterWorkspace;
