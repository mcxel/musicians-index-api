import { redirect } from "next/navigation";
import { magazineReaderUrl } from "@/lib/magazine/MagazineReaderRoutes";

/** MAGAZINE nav opens the active issue reader on the first readable spread. */
export default function MagazinePage() {
  redirect(magazineReaderUrl());
}
