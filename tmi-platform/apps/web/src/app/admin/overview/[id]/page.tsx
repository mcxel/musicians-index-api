import { redirect } from "next/navigation";

interface OverviewLegacyIdPageProps {
  params: {
    id: string;
  };
}

export default function OverviewLegacyIdPage(_props: OverviewLegacyIdPageProps) {
  // Legacy deep links such as /admin/overview/<id> should not 404.
  redirect("/admin/overview");
}
