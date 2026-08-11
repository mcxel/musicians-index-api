import DashboardWorkspaceContainer from "@/components/dashboard/DashboardWorkspaceContainer";

export const metadata = {
  title: "Dashboard | The Musician's Index",
  description: "Your personal TMI workspace — Fan, Performer, and Administration in one place.",
};

/**
 * /dashboard — Fan/Performer HQ home (Rule 26 + P0 mobile root-shell isolation).
 * Mounts exactly one role shell at a time. Admin/Overseer is never a sibling
 * here — authorized Admin entry navigates to /admin/overseer. No swipe role track.
 */
export default function DashboardPage() {
  return <DashboardWorkspaceContainer />;
}
