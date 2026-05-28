import { redirect } from "next/navigation";

export default function PromoterFallbackPage() {
  // Soft-launch safety: promoter subroutes are consolidated into stable dashboards.
  redirect("/dashboard/fan");
}
