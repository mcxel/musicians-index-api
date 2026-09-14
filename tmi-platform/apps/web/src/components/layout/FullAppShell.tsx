"use client";

/**
 * Full platform chrome — mounted for non-auth routes only.
 * Keep this out of the /auth critical path (see AuthAwareAppShell).
 */

import AppProviders from "@/components/providers";
import HudRuntimeProvider from "@/components/hud/HudRuntimeProvider";
import { TmiSessionProvider } from "@/hooks/SessionContext";
import GamificationHUD from "@/components/hud/GamificationHUD";
import LiveSyncProvider from "@/components/media/LiveSyncProvider";
import FirstRunExperienceOverlay from "@/components/onboarding/FirstRunExperienceOverlay";
import GoogleRoleChoiceRecoveryModal from "@/components/onboarding/GoogleRoleChoiceRecoveryModal";
import BotRuntimeProvider from "@/components/providers/BotRuntimeProvider";
import ChevronNavigation from "@/components/navigation/ChevronNavigation";
import TMIWorkspaceSwitcher from "@/components/system/TMIWorkspaceSwitcher";
import { NavigationLock } from "@/components/navigation/NavigationLock";
import NavigationRuntime from "@/components/navigation/NavigationRuntime";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import LiveMarqueeTicker from "@/components/live/LiveMarqueeTicker";
import { PWARegistration } from "@/components/mobile/PWARegistration";
import BetaModeBanner from "@/components/launch/BetaModeBanner";
import LiveFeedbackPanel from "@/components/feedback/LiveFeedbackPanel";
import { MonitorRuntimeProvider } from "@/components/monitor/MonitorRuntimeContext";
import MonitorRuntime from "@/components/monitor/MonitorRuntime";
import PlatformFooter from "@/components/layout/PlatformFooter";
import { WatchSessionProvider } from "@/lib/presence/WatchSessionContext";
import PersistentMiniPlayer from "@/components/presence/PersistentMiniPlayer";
import LaunchDock from "@/components/dock/LaunchDock";
import GlobalLiveDiscoveryOverlay from "@/components/discovery/GlobalLiveDiscoveryOverlay";
import BeatPurchaseInterestPrompt from "@/components/beats/BeatPurchaseInterestPrompt";
import AdConsentBanner from "@/components/ads/AdConsentBanner";

export default function FullAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <TmiSessionProvider>
        <MonitorRuntimeProvider>
          <HudRuntimeProvider>
            <WatchSessionProvider>
              <AdConsentBanner />
              <TMIWorkspaceSwitcher />
              <PWARegistration />
              <BetaModeBanner />
              {children}
              <PlatformFooter />
              <PWAInstallPrompt />
              <ChevronNavigation />
              <NavigationRuntime />
              <NavigationLock />
              <GamificationHUD />
              <LiveSyncProvider />
              <FirstRunExperienceOverlay />
              <GoogleRoleChoiceRecoveryModal />
              <BotRuntimeProvider />
              <LiveMarqueeTicker />
              <LiveFeedbackPanel />
              <MonitorRuntime />
              <PersistentMiniPlayer />
              <LaunchDock />
              <GlobalLiveDiscoveryOverlay />
              <BeatPurchaseInterestPrompt />
            </WatchSessionProvider>
          </HudRuntimeProvider>
        </MonitorRuntimeProvider>
      </TmiSessionProvider>
    </AppProviders>
  );
}
