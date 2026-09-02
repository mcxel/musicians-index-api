import { redirect } from "next/navigation";

// "instrumentals" was never a real StoreItemEngine category (fake demo data
// only) — redirect to the real Creator store's beat licensing instead.
export default function StoreInstrumentalsPage() {
  redirect("/store/creator");
}
