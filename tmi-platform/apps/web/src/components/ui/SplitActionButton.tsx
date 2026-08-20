"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { SoundSystemEngine } from "@/lib/sound/SoundSystemEngine";
import {
  SPLIT_ACTION_PRESETS,
  type SplitActionMenuItem,
  type SplitActionPreset,
} from "@/lib/ui/SplitActionPresets";

export interface SplitActionButtonProps {
  presetKey?: "go-live" | "challenge" | "mint-nft" | "messages" | "invite-fans" | "uploads";
  customPreset?: SplitActionPreset;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
  onPrimaryClick?: () => void;
  onMenuItemClick?: (item: SplitActionMenuItem) => void;
}

export default function SplitActionButton({
  presetKey,
  customPreset,
  size = "md",
  style,
  onPrimaryClick,
  onMenuItemClick,
}: SplitActionButtonProps) {
  const preset = customPreset ?? (presetKey ? SPLIT_ACTION_PRESETS[presetKey] : undefined);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!preset) return null;

  // SoundSystemEngine is ready
  const accent = preset.accentColor ?? "#FF2DAA";

  const sizeStyles = {
    sm: { height: 32, fontSize: 10, padding: "0 10px", iconSize: 12 },
    md: { height: 40, fontSize: 12, padding: "0 14px", iconSize: 14 },
    lg: { height: 48, fontSize: 14, padding: "0 18px", iconSize: 16 },
  }[size];

  const handlePrimaryClick = () => {
    SoundSystemEngine.play("click_primary");
    onPrimaryClick?.();
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    SoundSystemEngine.play("click_secondary");
    setOpen((curr) => !curr);
  };

  const handleItemClick = (item: SplitActionMenuItem) => {
    SoundSystemEngine.play("click_secondary");
    onMenuItemClick?.(item);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 10,
        border: "1.5px solid " + accent,
        background: "linear-gradient(180deg, " + accent + "22, rgba(5,2,10,0.85))",
        boxShadow: "0 0 14px " + accent + "44, inset 0 0 8px " + accent + "22",
        backdropFilter: "blur(8px)",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Render a <button> when a callback is provided to stay in-place; Link otherwise. */}
      {onPrimaryClick ? (
        <button
          type="button"
          onClick={handlePrimaryClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: sizeStyles.height,
            padding: sizeStyles.padding,
            color: "#FFFFFF",
            fontSize: sizeStyles.fontSize,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            cursor: "pointer",
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            transition: "all 0.15s ease",
            background: "transparent",
            border: "none",
          }}
        >
          <span style={{ fontSize: sizeStyles.iconSize }}>{preset.primaryIcon}</span>
          <span>{preset.primaryLabel}</span>
        </button>
      ) : (
        <Link
          href={preset.primaryHref}
          onClick={handlePrimaryClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: sizeStyles.height,
            padding: sizeStyles.padding,
            color: "#FFFFFF",
            fontSize: sizeStyles.fontSize,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            cursor: "pointer",
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ fontSize: sizeStyles.iconSize }}>{preset.primaryIcon}</span>
          <span>{preset.primaryLabel}</span>
        </Link>
      )}

      <div
        style={{
          width: 1,
          height: sizeStyles.height * 0.6,
          background: accent + "66",
        }}
      />

      <button
        type="button"
        onClick={handleChevronClick}
        aria-expanded={open}
        aria-label={"More options for " + preset.primaryLabel}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: sizeStyles.height * 0.8,
          height: sizeStyles.height,
          background: open ? accent + "33" : "transparent",
          color: accent,
          border: "none",
          cursor: "pointer",
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          fontSize: sizeStyles.fontSize,
          transition: "transform 0.2s ease, background 0.15s ease",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        ▼
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            marginTop: 6,
            right: 0,
            zIndex: 1000,
            minWidth: 230,
            borderRadius: 12,
            border: "1.5px solid " + accent,
            background: "linear-gradient(180deg, rgba(16,8,24,0.96) 0%, rgba(5,2,10,0.98) 100%)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.85), 0 0 20px " + accent + "33",
            backdropFilter: "blur(12px)",
            padding: 6,
          }}
        >
          {preset.menuItems.map((item) => {
            const itemContent = (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "background 0.12s ease",
                }}
              >
                {item.icon && <span style={{ fontSize: 14, marginTop: 1 }}>{item.icon}</span>}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </div>
                  {item.description && (
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.45)",
                        marginTop: 2,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  style={{ textDecoration: "none" }}
                >
                  {itemContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  padding: 0,
                }}
              >
                {itemContent}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
