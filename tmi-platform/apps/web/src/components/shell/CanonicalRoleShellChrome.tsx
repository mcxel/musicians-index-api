"use client";

/**
 * CanonicalRoleShellChrome — universal account/session chrome for business role hubs.
 *
 * Law: A ROLE SHELL IS NOT COMPLETE IF THE USER CAN ENTER IT BUT CANNOT CLEARLY LEAVE IT.
 *
 * Desktop: sticky top identity + account + optional nav
 * Mobile: TOP identity/account · CENTER workspace · TOOLS drawer (not squeezed desktop rails)
 *
 * One logout authority (RoleHubAccountMenu → canonicalLogout).
 * One persona switch authority (RoleSwitcherWidget / account triad).
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import RoleHubAccountMenu from "@/components/navigation/RoleHubAccountMenu";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";
import { HubBackNav } from "@/components/nav/HubBackNav";

export type RoleShellNavLink = { href: string; label: string };

export interface CanonicalRoleShellChromeProps {
  roleLabel: string;
  subtitle?: string;
  accentColor: string;
  homeHref?: string;
  navLinks?: RoleShellNavLink[];
  /** Compact trailing controls (mode toggles, etc.) — keep tiny on mobile. */
  trailingControls?: ReactNode;
  children: ReactNode;
}

export default function CanonicalRoleShellChrome({
  roleLabel,
  subtitle,
  accentColor,
  homeHref = "/home/1",
  navLinks = [],
  trailingControls,
  children,
}: CanonicalRoleShellChromeProps) {
  const [isMobile, setIsMobile] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!toolsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToolsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toolsOpen]);

  const barStyle: CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: isMobile ? "10px 12px" : "10px 18px",
    background: "rgba(4,6,14,0.96)",
    borderBottom: `1px solid ${accentColor}44`,
    backdropFilter: "blur(12px)",
    minHeight: 52,
  };

  return (
    <div
      data-canonical-role-shell="1"
      data-role-shell-mobile={isMobile ? "1" : "0"}
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header data-role-shell-header="1" style={barStyle}>
        <HubBackNav accentColor={accentColor} homeHref={homeHref} fallbackRoute={homeHref} />
        <div style={{ minWidth: 0, flex: isMobile ? 1 : undefined }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: accentColor,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {roleLabel}
          </div>
          {subtitle && !isMobile ? (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{subtitle}</div>
          ) : null}
        </div>

        {!isMobile && navLinks.length > 0 ? (
          <nav
            aria-label="Role tools"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              overflowX: "auto",
              flex: 1,
              marginLeft: 12,
              scrollbarWidth: "none",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isMobile && (navLinks.length > 0 || trailingControls) ? (
            <button
              type="button"
              data-testid="role-shell-tools-toggle"
              onClick={() => setToolsOpen(true)}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                padding: "7px 10px",
                borderRadius: 8,
                border: `1px solid ${accentColor}66`,
                background: `${accentColor}18`,
                color: accentColor,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              TOOLS
            </button>
          ) : null}
          {!isMobile ? trailingControls : null}
          <RoleSwitcherWidget accentColor={accentColor} buttonLabel="SWITCH" />
          <RoleHubAccountMenu accentColor={accentColor} showInlineSignOut />
        </div>
      </header>

      <main data-role-shell-workspace="1" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        {children}
      </main>

      {toolsOpen && isMobile ? (
        <div
          data-role-shell-tools-drawer="1"
          role="dialog"
          aria-label="Role tools"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9400,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            aria-label="Close tools"
            onClick={() => setToolsOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              border: "none",
              cursor: "pointer",
            }}
          />
          <div
            style={{
              position: "relative",
              maxHeight: "min(72dvh, 640px)",
              background: "rgba(4,6,14,0.98)",
              borderTop: `2px solid ${accentColor}`,
              borderRadius: "16px 16px 0 0",
              padding: "12px 14px 20px",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
                {roleLabel} · TOOLS
              </span>
              <button
                type="button"
                onClick={() => setToolsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>
            {trailingControls ? <div style={{ marginBottom: 14 }}>{trailingControls}</div> : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setToolsOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: accentColor,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
