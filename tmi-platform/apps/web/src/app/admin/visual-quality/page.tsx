import { listQualityReports } from "@/lib/ai-visuals/VisualQualityAuthorityEngine";

export default function AdminVisualQualityPage() {
  const reports = listQualityReports();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Visual Quality</h1>
      <p>Quality authority report stream.</p>
      <pre>{JSON.stringify(reports, null, 2)}</pre>
    </main>
  );
}
