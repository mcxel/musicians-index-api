import HomeKeyboardNav from "@/components/home/HomeKeyboardNav";
import MagazineNavBar from "@/components/magazine/MagazineNavBar";
import { PersistentShellProvider } from "@/providers/PersistentShellProvider";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersistentShellProvider>
      <HomeKeyboardNav />
      <MagazineNavBar />

      <div style={{ paddingTop: 48, minHeight: "100vh", background: "#07060f" }}>{children}</div>
    </PersistentShellProvider>
  );
}
