"use client";
import { useRouter } from "next/navigation";

interface ProfileBackButtonProps {
  fallbackHref: string;
  label: string;
  accentColor: string;
}

/**
 * Smart back button for profile pages.
 * Uses router.back() when the user navigated here from within the platform
 * (history.length > 1), so clicking back returns them exactly where they
 * came from — their hub, a discovery rail, a search result, etc.
 * Falls back to the static fallbackHref (e.g. /performers) only when there
 * is no browser history (e.g. direct link / fresh tab).
 */
export default function ProfileBackButton({
  fallbackHref,
  label,
  accentColor,
}: ProfileBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase",
        padding: 0,
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
    >
      ← {label}
    </button>
  );
}
