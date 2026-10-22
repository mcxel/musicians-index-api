/**
 * hubDrawerGuides — per-drawer identity, one-line purpose and walkthrough steps.
 *
 * Every step points at a control that already exists in that drawer
 * (`targetTestId`). A step with no real control is not listed.
 */

export interface HubDrawerGuideStep {
  id: string;
  label: string;
  hint: string;
  targetTestId: string;
}

export interface HubDrawerGuide {
  title: string;
  purpose: string;
  steps: readonly HubDrawerGuideStep[];
}

function purposeOnly(title: string, purpose: string): HubDrawerGuide {
  return { title, purpose, steps: [] };
}

export const HUB_DRAWER_GUIDES: Readonly<Record<string, HubDrawerGuide>> = {
  "your-page": {
    title: "YOUR PAGE",
    purpose: "Build, preview, save and publish the public page people see when they visit you on TMI.",
    steps: [
      { id: "setup", label: "Set up your page", hint: "Pick a starting design.", targetTestId: "studio-starters" },
      { id: "customize", label: "Customize your presentation", hint: "Open the tools to add writing, photos, shapes and backgrounds.", targetTestId: "view-mode-tools" },
      { id: "preview", label: "Preview it", hint: "Turn on Preview, then pick PHONE to see it the way a visitor will.", targetTestId: "studio-preview-toggle" },
      { id: "save", label: "Save your changes", hint: "Save your draft to TMI.", targetTestId: "studio-save" },
      { id: "view", label: "View your public page", hint: "Open the page visitors see.", targetTestId: "view-your-page" },
    ],
  },
  lobby: purposeOnly("LIVE LOBBY WALL", "See every room that is live right now and step into one."),
  store: purposeOnly("SHOP", "Browse and buy items, skins and gear from the TMI shop."),
  "memory-wall": purposeOnly("MEMORY WALL", "Keep the moments you capture on TMI in one place."),
  "playlist-studio": purposeOnly("PLAYLIST LIBRARY", "Build, play and share your playlists."),
  yopho: purposeOnly("YOPHO", "Design your YoPho card and Fan ID."),
  "prize-vault": purposeOnly("REWARDS", "See the rewards and prizes you have earned."),
  "room-controls": purposeOnly("VENUE", "Open the controls for the venue you are in."),
  "live-destinations": purposeOnly("CAST", "Choose where your live show goes out."),
  messaging: purposeOnly("MESSAGES", "Talk with people, your community and your room."),
  communications: purposeOnly("MESSAGES", "Talk with people, your community and your room."),
  "avatar-quick": purposeOnly("AVATAR", "Change how your avatar looks."),
  inventory: purposeOnly("INVENTORY", "See the items you own."),
  settings: purposeOnly("SETTINGS", "Change your account, privacy and Hub settings."),
  notes: purposeOnly("NOTES", "Write and keep private notes."),
};

export function hubDrawerGuide(drawerId: string | null | undefined): HubDrawerGuide | null {
  if (!drawerId) return null;
  return HUB_DRAWER_GUIDES[drawerId] ?? null;
}
