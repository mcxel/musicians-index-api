import React from "react";
import "@/styles/tmiTypography.css";
import { tmiFontVariables } from "@/styles/fonts";

export function TmiSectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`${tmiFontVariables} tmi-promo-title border-b-2 border-emerald-500/30 pb-2 mb-4 ${className}`}>
      {children}
    </h2>
  );
}