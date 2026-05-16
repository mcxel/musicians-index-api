import AdminVisualCommandWindow from "@/components/admin/AdminVisualCommandWindow";
import AdminBotIdentitySummaryCard from "@/components/admin/AdminBotIdentitySummaryCard";
import AdminBotGovernanceSummaryCard from "@/components/admin/AdminBotGovernanceSummaryCard";

export const metadata = {
  title: "Admin Visual Command Window | TMI",
  description: "Live creative production console for queue, slots, workers, motion, and quality control.",
};

export default function AdminVisualCommandPage() {
  return (
    <>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "18px 18px 0" }}>
        <AdminBotGovernanceSummaryCard />
        <AdminBotIdentitySummaryCard />
      </div>
      <AdminVisualCommandWindow />
    </>
  );
}
