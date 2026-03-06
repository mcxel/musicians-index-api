import type { UserPublic, ArtistPublic } from "@tmi/contracts";
import { UserManagement } from "@/components/admin/UserManagement";

async function AdminDashboard() {
  // Server-side auth checks have been moved to apps/api. Web should call the
  // API for privileged actions. During build and local checks we avoid
  // initializing auth adapters that may import Prisma.

  // Placeholder DTOs when API is not available during build/time-checks.
  const users = [] as UserPublic[];
  const artists = [] as ArtistPublic[];

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">Admin Dashboard</h1>
      <UserManagement users={users} artists={artists} />
    </div>
  );
}

export default AdminDashboard;
