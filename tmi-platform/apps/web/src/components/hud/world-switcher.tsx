type HudWorldSwitcherProps = {
  activeWorldId?: string;
};

export function HudWorldSwitcher({ activeWorldId }: HudWorldSwitcherProps) {
  return <div>World Switcher {activeWorldId ? `· ${activeWorldId}` : ""}</div>;
}

export default HudWorldSwitcher;
