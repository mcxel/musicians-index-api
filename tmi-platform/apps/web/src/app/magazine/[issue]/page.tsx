import { redirect } from "next/navigation";
import { magazineReaderUrl } from "@/lib/magazine/MagazineReaderRoutes";

export default function LegacyMagazineIssuePage() {
  redirect(magazineReaderUrl());
}
