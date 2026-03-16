import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ROUTING_STATE_COOKIE,
  destinationFromRoutingState,
  verifyRoutingState,
} from "@/lib/routingState";

export default async function DashboardRouterPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("phase11_session")?.value;
  if (!sessionToken) {
    redirect("/auth?next=%2Fdashboard");
  }

  const routingState = await verifyRoutingState(cookieStore.get(ROUTING_STATE_COOKIE)?.value);
  if (routingState) {
    redirect(destinationFromRoutingState(routingState));
  }

  redirect("/onboarding");
}
