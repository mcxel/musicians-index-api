"use client";
import { useRouter } from "next/navigation";
import FaceRecovery from "@/components/face/FaceRecovery";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/layout/HUDFrame";
import FooterHUD from "@/components/layout/FooterHUD";

export default function AccountRecoveryPage() {
  const router = useRouter();
  return (
    <PageShell>
      <HUDFrame>
        <FaceRecovery
          onSuccess={() => router.push("/login?recovered=1")}
          onCancel={() => router.push("/login")}
        />
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
