import type { Metadata } from "next";
import EOSCertificationClient from "./EOSCertificationClient";

export const metadata: Metadata = {
  title: "EOS Certification | TMI",
  description: "Experience Operating System — Phase 1 foundation certification",
};

export default function EosTestPage() {
  return <EOSCertificationClient />;
}
