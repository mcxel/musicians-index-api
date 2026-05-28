import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function roleToDestination(role: string): string {
  const r = role.toLowerCase();
  if (r === "admin" || r === "staff") return "/admin";
  if (r === "artist")     return "/dashboard/artist";
  if (r === "performer")  return "/dashboard/performer";
  if (r === "sponsor")    return "/dashboard/sponsor";
  if (r === "advertiser") return "/dashboard/advertiser";
  if (r === "venue")      return "/dashboard/venue";
  if (r === "writer")     return "/dashboard/writer";
  if (r === "promoter")   return "/dashboard/fan";
  if (r === "fan" || r === "user") return "/dashboard/fan";
  return "/dashboard/fan";
}

export default async function DashboardRouterPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("tmi_session_id")?.value;

  if (!sessionId) {
    redirect("/auth?next=%2Fdashboard");
  }

  const role = cookieStore.get("tmi_role")?.value ?? "user";
  redirect(roleToDestination(role));
}
