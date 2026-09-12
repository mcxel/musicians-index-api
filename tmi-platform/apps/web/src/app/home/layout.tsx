import HomeKeyboardNav from "@/components/home/HomeKeyboardNav";
import HomeRouteChevronNav from "@/components/home/HomeRouteChevronNav";
import HomeAutoRotate from "@/components/home/HomeAutoRotate";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";
import { PersistentShellProvider } from "@/providers/PersistentShellProvider";

/**
 * Home shell — Slice 1A: one canonical GlobalTmiHeader (SHELL-01/02).
 * MagazineNavBar retired from this mount (legacy account chrome + duplicate header).
 * Home page dots live inside GlobalTmiHeader row 2.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersistentShellProvider>
      <HomeKeyboardNav />
      <HomeRouteChevronNav />
      <HomeAutoRotate />
      <GlobalTmiHeader />

      <div
        style={{
          minHeight: "100vh",
          background: "#07060f",
          overflowX: "hidden",
          maxWidth: "100vw",
        }}
      >
        {children}
      </div>
    </PersistentShellProvider>
  );
}
