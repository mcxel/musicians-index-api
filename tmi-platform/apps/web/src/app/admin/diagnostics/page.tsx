import AdminOpsConsole from "@/components/admin-ops/AdminOpsConsole";
import { adminOpsLinks, commonAdminActions } from "@/components/admin-ops/adminOpsConfig";
import AdminBotGovernanceSummaryCard from "@/components/admin/AdminBotGovernanceSummaryCard";

const metrics = [
  { label: "Bot Reports", value: "live", tone: "green" as const },
  { label: "MC Status", value: "visible", tone: "yellow" as const },
  { label: "Big Ace", value: "synced", tone: "white" as const },
  { label: "Route Links", value: "tracked", tone: "green" as const },
  { label: "Risk", value: "scored", tone: "yellow" as const },
];

const rows = [
  { primary: "Governed Workforce", secondary: "directive and objective enforcement", status: "stable", value: "active", chips: ["directives", "objectives"] },
  { primary: "Task Trace", secondary: "route and engine assignment chain", status: "stable", value: "linked", chips: ["tasks", "routing"] },
  { primary: "MC Approval", secondary: "green yellow red authority", status: "watch", value: "audited", chips: ["mc", "approvals"] },
  { primary: "Big Ace Visibility", secondary: "overseer-level status exposure", status: "stable", value: "on", chips: ["big ace", "oversight"] },
];

export default function AdminDiagnosticsPage() {
  return (
    <>
      <div style={{ padding: "16px 16px 0" }}>
        <AdminBotGovernanceSummaryCard />
      </div>
      <AdminOpsConsole
        title="Administrator Diagnostics"
        subtitle="Governance-level diagnostics for bot workforce chain accountability."
        metrics={metrics}
        rowsTitle="Governance Diagnostics"
        rows={rows}
        actions={commonAdminActions}
        quickLinks={adminOpsLinks}
      />
    </>
  );
}
