import LegalCommandCenter from "@/components/admin/legal/LegalCommandCenter";

export const metadata = {
  title: "Legal Command Center | TMI Admin",
  description:
    "TMI Global Legal, Privacy & Records Command — Defensible Compliance & Accountability.",
};

/**
 * /admin/legal — LegalCommandCenter workspace.
 * Role-gated by admin layout (ADMIN/STAFF) + API requireAdmin.
 */
export default function AdminLegalPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(ellipse at top, #140a22 0%, #050510 55%)",
        color: "#fff",
      }}
    >
      <LegalCommandCenter />
    </main>
  );
}
