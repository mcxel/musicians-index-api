import { listMotionDeployments } from "@/lib/ai-motion/AiMotionDeploymentEngine";

export default function AdminMotionDeploymentsPage() {
  const deployments = listMotionDeployments();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Motion Deployments</h1>
      <p>Deployed motion records.</p>
      <pre>{JSON.stringify(deployments, null, 2)}</pre>
    </main>
  );
}
