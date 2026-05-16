"use client";
import React from "react";
import type { RoleLayout } from "@/lib/dashboard/DashboardRoleLayoutEngine";

interface DashboardShellProps {
  layout: RoleLayout;
  userId: string;
  children: React.ReactNode;
}

export default function DashboardShell({ layout, children }: DashboardShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${layout.accentColor}22`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: layout.accentColor,
            fontWeight: 800,
          }}
        >
          TMI
        </span>
        <span
          style={{
            width: 1,
            height: 16,
            background: `${layout.accentColor}44`,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
          {layout.title}
        </span>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 20px",
          display: "grid",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
