"use client";
import React from "react";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      maxWidth: 1340,
      margin: "0 auto",
      padding: "80px 20px 40px",
      boxSizing: "border-box",
    }}>
      {children}
    </main>
  );
}
