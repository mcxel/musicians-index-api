import HomeKeyboardNav from "@/components/home/HomeKeyboardNav";
import HomeRouteChevronNav from "@/components/home/HomeRouteChevronNav";
import MagazineNavBar from "@/components/magazine/MagazineNavBar";
import { PersistentShellProvider } from "@/providers/PersistentShellProvider";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersistentShellProvider>
      <HomeKeyboardNav />
      <HomeRouteChevronNav />
      <MagazineNavBar />

      <div style={{ paddingTop: 48, minHeight: "100vh", background: "#07060f", overflowX: "hidden", maxWidth: "100vw" }}>{children}</div>
    </PersistentShellProvider>
  );
}
