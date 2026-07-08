"use client";

import { useRef, useState, type ReactNode } from "react";
import { WorkspaceProvider } from "@/components/shell/WorkspaceProvider";
import { BottomWorkspaceDrawer } from "@/components/shell/BottomWorkspaceDrawer";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { resolveWorkspaceAccess } from "@/components/shell/workspaceRegistry";
import type { WorkspaceRole } from "@/components/shell/workspaceTypes";

type SlotContent = ReactNode;
type LeftRailState = { compact: boolean; pinned: boolean };
type RightRailState = { mode: "compact" | "expanded" | "hidden" };

interface WorkspaceShellProps {
  globalHeader?: SlotContent;
  heroStage: SlotContent;
  leftLauncher?: SlotContent | ((state: LeftRailState) => SlotContent);
  rightSocialRail?: SlotContent | ((state: RightRailState) => SlotContent);
  overlayLayer?: SlotContent;
  workspaceRole?: WorkspaceRole;
}

export function WorkspaceShell({
  globalHeader,
  heroStage,
  leftLauncher,
  rightSocialRail,
  overlayLayer,
  workspaceRole = "fan",
}: WorkspaceShellProps) {
  const stableHeroRef = useRef<SlotContent>(heroStage);
  const availableWorkspaceIds = resolveWorkspaceAccess(workspaceRole, workspaceRole !== "guest");
  const [leftHover, setLeftHover] = useState(false);
  const [leftPinned, setLeftPinned] = useState(false);
  const [rightHidden, setRightHidden] = useState(false);
  const [rightHover, setRightHover] = useState(false);
  const [rightPinned, setRightPinned] = useState(false);

  const leftCompact = !(leftHover || leftPinned);
  const leftWidthPx = leftCompact ? 70 : 240;

  // Right rail mirrors the left rail's hover-to-expand behavior: compact by
  // default, expands on hover or when pinned, fully hidden only when the
  // user explicitly collapses it via the Hide control.
  const rightCompact = !(rightHover || rightPinned);
  const rightMode: "compact" | "expanded" | "hidden" = rightHidden ? "hidden" : rightCompact ? "compact" : "expanded";
  const rightWidthPx = rightMode === "hidden" ? 24 : rightMode === "compact" ? 70 : 300;

  const leftLauncherNode = typeof leftLauncher === "function"
    ? leftLauncher({ compact: leftCompact, pinned: leftPinned })
    : leftLauncher;

  const rightRailNode = typeof rightSocialRail === "function"
    ? rightSocialRail({ mode: rightMode })
    : rightSocialRail;

  return (
    <WorkspaceProvider workspaceRole={workspaceRole} availableWorkspaceIds={availableWorkspaceIds}>
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateRows: "72px 1fr",
          background: "radial-gradient(1200px 600px at 50% 0%, rgba(70, 10, 120, 0.24), rgba(4, 6, 20, 1))",
          color: "#f4f1ff",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(4, 6, 20, 0.86)",
            backdropFilter: "blur(16px)",
            zIndex: 40,
          }}
        >
          {globalHeader ?? null}
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${leftWidthPx}px minmax(0, 1fr) ${rightWidthPx}px`,
            minHeight: 0,
            paddingBottom: 0,
            transition: "grid-template-columns 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <aside
            onMouseEnter={() => setLeftHover(true)}
            onMouseLeave={() => setLeftHover(false)}
            onClick={(event) => {
              if (event.shiftKey) {
                setLeftPinned((current) => !current);
              }
            }}
            title="Shift+Click to pin/unpin left rail expansion"
            style={{
              borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(3, 4, 16, 0.68)",
              backdropFilter: "blur(14px)",
              overflow: "auto",
              minWidth: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 3,
                display: "flex",
                justifyContent: leftCompact ? "center" : "space-between",
                alignItems: "center",
                gap: 6,
                padding: "8px 8px 6px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(3, 4, 16, 0.88)",
                backdropFilter: "blur(14px)",
              }}
            >
              {!leftCompact && (
                <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(245,239,255,0.65)", fontWeight: 700 }}>
                  LEFT RAIL
                </div>
              )}

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setLeftPinned((current) => (leftCompact ? true : !current));
                  }}
                  title={leftCompact ? "Expand left rail" : leftPinned ? "Unpin left rail" : "Pin left rail"}
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: leftPinned ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.08)",
                    color: "#f4f1ff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: leftCompact ? "4px 7px" : "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  {leftCompact ? ">" : leftPinned ? "Unpin" : "Pin"}
                </button>

                {!leftCompact && (
                  <button
                    type="button"
                    onClick={() => setLeftPinned(false)}
                    title="Compact left rail"
                    style={{
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#f4f1ff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Compact
                  </button>
                )}
              </div>
            </div>

            {leftLauncherNode ?? null}
          </aside>

          <main style={{ position: "relative", minWidth: 0, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0 }}>{stableHeroRef.current}</div>
            {overlayLayer ? <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20 }}>{overlayLayer}</div> : null}
          </main>

          <aside
            onMouseEnter={() => setRightHover(true)}
            onMouseLeave={() => setRightHover(false)}
            onClick={(event) => {
              if (event.shiftKey) {
                setRightPinned((current) => !current);
              }
            }}
            title="Shift+Click to pin/unpin right rail expansion"
            style={{
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(3, 4, 16, 0.68)",
              backdropFilter: "blur(14px)",
              overflow: "auto",
              minWidth: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 3,
                display: "flex",
                justifyContent: rightMode === "compact" ? "center" : "space-between",
                alignItems: "center",
                gap: 6,
                padding: rightMode === "hidden" ? "10px 2px" : "8px 8px 6px",
                borderBottom: rightMode === "hidden" ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: "rgba(3, 4, 16, 0.88)",
                backdropFilter: "blur(14px)",
              }}
            >
              {rightMode === "hidden" ? (
                <button
                  type="button"
                  onClick={() => setRightHidden(false)}
                  title="Show right rail"
                  style={{
                    width: "100%",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#f4f1ff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "8px 0",
                    cursor: "pointer",
                  }}
                >
                  &lt;
                </button>
              ) : (
                <>
                  {rightMode !== "compact" && (
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(245,239,255,0.65)", fontWeight: 700 }}>
                      RIGHT RAIL
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setRightPinned((current) => (rightCompact ? true : !current))}
                      title={rightCompact ? "Expand right rail" : rightPinned ? "Unpin right rail" : "Pin right rail"}
                      style={{
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: rightPinned ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.08)",
                        color: "#f4f1ff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: rightMode === "compact" ? "4px 7px" : "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      {rightCompact ? "<" : rightPinned ? "Unpin" : "Pin"}
                    </button>
                    {rightMode !== "compact" && (
                      <button
                        type="button"
                        onClick={() => setRightPinned(false)}
                        title="Compact right rail"
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.08)",
                          color: "#f4f1ff",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Compact
                      </button>
                    )}
                    {rightMode !== "compact" && (
                      <button
                        type="button"
                        onClick={() => setRightHidden(true)}
                        title="Hide right rail"
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.08)",
                          color: "#f4f1ff",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {rightMode !== "hidden" ? rightRailNode ?? null : null}
          </aside>
        </div>

        <BottomWorkspaceDrawer />
        <CommandPalette />
      </div>
    </WorkspaceProvider>
  );
}

export default WorkspaceShell;
