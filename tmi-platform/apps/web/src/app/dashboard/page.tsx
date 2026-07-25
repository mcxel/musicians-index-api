import DashboardWorkspaceContainer from "@/components/dashboard/DashboardWorkspaceContainer";

export const metadata = {
  title: "Dashboard | The Musician's Index",
  description: "Your personal TMI workspace — Fan, Performer, and Administration in one place.",
};

/**
 * /dashboard — permanent workspace home (Rule 26: role-specific provisioning).
 * Renders DashboardWorkspaceContainer which mounts Fan / Performer / Admin
 * workspaces simultaneously and switches visibility in-place (no navigation).
 * Session restore, keyboard shortcuts (Ctrl/Cmd+1/2/3), and mobile swipe
 * are handled client-side inside the container.
 */
export default function DashboardPage() {
  return <DashboardWorkspaceContainer />;
}
