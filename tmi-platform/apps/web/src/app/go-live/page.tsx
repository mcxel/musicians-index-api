import { redirect } from "next/navigation";

/**
 * LEGACY route — canonical Go Live is in-place via Command Center /live/go.
 * Production traffic always redirects; ?wizard=1 retained for dev archaeology only.
 */
export default function GoLiveRedirectPage({
  searchParams,
}: {
  searchParams?: { setup?: string; wizard?: string };
}) {
  const legacyWizard =
    searchParams?.setup === "1" ||
    searchParams?.setup === "true" ||
    searchParams?.wizard === "1" ||
    searchParams?.wizard === "true";

  if (legacyWizard && process.env.NODE_ENV === "development") {
    redirect("/live/go?legacyWizard=1");
  }

  redirect("/hub/performer?golive=1");
}
