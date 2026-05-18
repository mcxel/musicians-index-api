import { redirect } from "next/navigation";

// Fallback if next.config.js redirect doesn't fire (e.g. local dev without edge)
export default function RootPage() {
  redirect("/home/1");
}
