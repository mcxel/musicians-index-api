import { getMotionSlot, updateMotionSlotStatus } from "./AiMotionSlotRegistry";

export type MotionDeployment = {
  deploymentId: string;
  slotId: string;
  motionId: string;
  deployedAt: number;
};

const deployments = new Map<string, MotionDeployment>();

function id(): string {
  return `mdep_${Math.random().toString(36).slice(2, 11)}`;
}

export function deployMotion(slotId: string, motionId: string): MotionDeployment | null {
  const slot = getMotionSlot(slotId);
  if (!slot) return null;

  const deployment: MotionDeployment = {
    deploymentId: id(),
    slotId,
    motionId,
    deployedAt: Date.now(),
  };

  updateMotionSlotStatus(slotId, "deployed");
  deployments.set(deployment.deploymentId, deployment);
  return deployment;
}

export function listMotionDeployments(): MotionDeployment[] {
  return [...deployments.values()].sort((a, b) => b.deployedAt - a.deployedAt);
}
