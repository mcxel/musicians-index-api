import type { Metadata } from "next";
import BillboardSplitHub from "@/components/billboards/BillboardSplitHub";

export const metadata: Metadata = {
  title: "Billboards | BernoutGlobal",
  description: "Public artist billboard campaigns on The Musician's Index.",
  alternates: { canonical: "/billboards" },
};

export default function BillboardsPage() {
  return <BillboardSplitHub />;
}
