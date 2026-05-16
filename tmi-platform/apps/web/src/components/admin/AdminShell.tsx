"use client";

import { type ReactNode } from "react";
import AdminTopBar from "@/components/admin/AdminTopBar";

type AdminShellProps = {
  hubId: string;
  hubTitle: string;
  hubSubtitle?: string;
  backHref?: string;
  children: ReactNode;
};

export default function AdminShell({
  hubId,
  hubTitle,
  hubSubtitle,
  backHref = "/admin",
  children,
}: AdminShellProps) {
  return (
    <main
      data-admin-shell={hubId}
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background:
          "radial-gradient(circle at 8% 0%, rgba(250,204,21,0.17), transparent 36%), " +
          "radial-gradient(circle at 92% 4%, rgba(168,85,247,0.22), transparent 34%), " +
          "radial-gradient(circle at 50% 100%, rgba(0,255,255,0.04), transparent 40%), " +
          "#03020b",
        color: "#e2e8f0",
        fontFamily: "'Orbitron', 'Rajdhani', 'Segoe UI', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      <AdminTopBar
        hubId={hubId}
        hubTitle={hubTitle}
        hubSubtitle={hubSubtitle}
        backHref={backHref}
      />
      <section
        data-admin-content={hubId}
        style={{
          padding: "12px 14px",
          minHeight: 0,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.22,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent 65%)",
          }}
        />
        {children}
      </section>
    </main>
  );
}
