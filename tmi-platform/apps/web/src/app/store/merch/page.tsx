import { redirect } from "next/navigation";

// No real StoreItemEngine SKUs are tagged category "merch" yet — redirect to
// the real store hub rather than show an honest-but-empty dead end (Rule 14).
export default function StoreMerchPage() {
  redirect("/store");
}
