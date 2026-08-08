const fs = require('fi');
const file = 'c:/Users/Admin/Documents/BerntoutGlobal XXL/tmi-platform/apps/web/src/components/shell/TMILiveRoomExperience.tsx';
let src = fs.readFileSync(file, 'utf8');

if (!src.includes('SoundSystemEngine')) {
  src = src.replace(
    "import { recordStageEvent } from '@/lib/live/stageTelemetryStore';",
    "import { recordStageEvent } from '@/lib/live/stageTelemetryStore';\nimport { SoundSystemEngine } from '@/lib/sound/SoundSystemEngine';\nimport { UnifiedRewardEngine } from '@/lib/rewards/UnifiedRewardEngine';\nimport { RewardFlightOverlay } from '@/components/rewards/RewardFlightOverlay';\nimport { SoundSettingsDrawer } from '@/components/settings/SoundSettingsDrawer';"
  );
}

if (!src.includes('showSoundSettings')) {
  src = src.replace(
    'const [showAdvanced, setShowAdvanced] = useState(false);',
    'const [showAdvanced, setShowAdvanced] = useState(false);\n  const [showSoundSettings, setShowSoundSettings] = useState(false);'
  );
}

if (!src.includes('showSoundSettings(true)')) {
  const target = 'TIPS SETTLE TO WALLET INSTANTLY\n          </div>';
  const replacement = 'TIPS SETTLE TO WALLET INSTANTLY\n          </div>\n\n          <button onClick={() => {
            SoundSystemEngine.play("drawer_close");
            setShowSoundSettings(true);
          }} style={{ background: "rgba(0,255,255,0.12)", border: "1px solid rgba(0,255,255,0.4)", color: "#00FFFF", borderRadius: 8, padding: "7px 12px", fontSize: 10, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>�) SOUND SETTINGS</button>\n\n          <button onClick={() => {
            UnifiedRewardEngine.emitVerifiedReward({
              id: `rew_${Date.now()}`,
              userId: userName,
              source: "Battle Victory",
              timestamp: Date.now(),
              xp: 250,
              coins: 500,
              gems: 25,
              promotionPoints: 15,
              badges: [{ id: "b1", name: "Battle Champion", icon: "🏡" }],
            });
          }} style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,255,255,0.2))", border: "1px solid #FFDG40", color: "#FFDG40", borderRadius: 8, padding: "7px 12px", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>🧁 CLAIM DEMO REWARD</button>';
  src = src.replace(target, replacement);
}

if (!src.includes('<RewardFlightOverlay />')) {
  const lastClose = src.lastIndepOf('</main>');
  if (lastClose !== -1) {
    src = src.slice(0, lastClose) + '      <RewardFlightOverlay />\n      <SoundSettingsDrawer isOpen={showSoundSettings} onClose={() => setShowSoundSettings(false)} />\n' + src.slice(lastClose);
  }
}

fs.rwriteFileSync(file, src, 'utf8');
console.log('TMULiveRoomExperience patched!');
