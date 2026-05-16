"use client";

import ProfitLeakScanner from "@/components/admin/profit/ProfitLeakScanner";
import RevenueCorrectionRail from "@/components/admin/profit/RevenueCorrectionRail";
import MarginMonitor from "@/components/admin/profit/MarginMonitor";
import BookingProfitRail from "@/components/admin/profit/BookingProfitRail";
import PrizeCostRail from "@/components/admin/profit/PrizeCostRail";
import SponsorROITracker from "@/components/admin/profit/SponsorROITracker";
import MerchVelocityRail from "@/components/admin/profit/MerchVelocityRail";
import AdEfficiencyRail from "@/components/admin/profit/AdEfficiencyRail";
import VenueYieldRail from "@/components/admin/profit/VenueYieldRail";
import EmergencyCorrectionPanel from "@/components/admin/profit/EmergencyCorrectionPanel";

type ProfitCommandCenterProps = {
  title?: string;
};

export default function ProfitCommandCenter({ title = "MC Michael Charlie Profit Optimization Engine" }: ProfitCommandCenterProps) {
  return (
    <section
      data-admin-profit="command-center"
      style={{
        border: "1px solid rgba(251,191,36,0.34)",
        borderRadius: 14,
        background:
          "radial-gradient(circle at 0% 0%, rgba(251,191,36,0.11), transparent 30%), " +
          "radial-gradient(circle at 100% 0%, rgba(168,85,247,0.12), transparent 28%), " +
          "rgba(9,6,20,0.9)",
        padding: 14,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, color: "#fcd34d", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Profit Optimization Engine
        </p>
        <h2 style={{ margin: "7px 0 0", color: "#f8fafc", fontSize: 18, lineHeight: 1.2 }}>{title}</h2>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          <ProfitLeakScanner />
          <RevenueCorrectionRail />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
          <MarginMonitor />
          <BookingProfitRail />
          <PrizeCostRail />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
          <SponsorROITracker />
          <MerchVelocityRail />
          <AdEfficiencyRail />
          <VenueYieldRail />
        </div>

        <EmergencyCorrectionPanel />
      </div>
    </section>
  );
}
