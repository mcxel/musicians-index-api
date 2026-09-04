import { redirect } from "next/navigation";

// "bundles" was never a real StoreItemEngine category (fake demo data only)
// — redirect to the real store hub rather than show an empty dead end.
export default function StoreBundlesPage() {
  redirect("/store");
}
