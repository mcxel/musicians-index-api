import Link from "next/link";
import DeviceTrustPanel from "@/components/auth/DeviceTrustPanel";
import LoginAlertCard from "@/components/auth/LoginAlertCard";

type Props = {
  searchParams?: {
    email?: string;
  };
};

export default function DeviceTrustPage({ searchParams }: Props) {
  const email = (searchParams?.email ?? "").trim().toLowerCase();

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Device Trust</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Bind and manage trusted devices for lower-friction secure sign-in.
        </p>
        <LoginAlertCard details="Unrecognized-device logins should trigger alerts and device review." severity="warning" />
        <DeviceTrustPanel email={email} />
        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          ← Back to auth
        </Link>
      </div>
    </main>
  );
}
