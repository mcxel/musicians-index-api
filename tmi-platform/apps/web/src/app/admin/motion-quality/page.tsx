import { listMotionQualityReports } from "@/lib/ai-motion/AiMotionQualityEngine";

export default function AdminMotionQualityPage() {
  const reports = listMotionQualityReports();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Motion Quality</h1>
      <p>Motion quality authority reports.</p>
      <pre>{JSON.stringify(reports, null, 2)}</pre>
    </main>
  );
}
