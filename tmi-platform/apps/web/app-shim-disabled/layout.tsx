import AppProviders from "@/components/providers";
import DesignOverlay from "@/components/dev/DesignOverlay";
import NavigationRuntime from "@/components/navigation/NavigationRuntime";
import MainNav from "@/components/nav/MainNav";
import ReactionOverlayCanvas from "@/packages/foundation-effects/ReactionOverlayCanvas";
import MotionLayer from "@/components/motion/MotionLayer";
import "../src/app/globals.css";

const isDev = process.env.NODE_ENV !== "production";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "block", background: "black", color: "white" }}>
        <AppProviders>
          <NavigationRuntime />
          <MainNav />
          <div style={{ position: "relative", minHeight: "100vh" }}>
            <MotionLayer>
              {children}
            </MotionLayer>
            <ReactionOverlayCanvas activeEffects={[]} />
          </div>
          {isDev && <DesignOverlay />}
        </AppProviders>
      </body>
    </html>
  );
}
