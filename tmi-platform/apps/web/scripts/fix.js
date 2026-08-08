const fs = require('fs');
const drawerPath = 'c:/Users/Admin/Documents/BerntoutGlobal XXL/tmi-platform/apps/web/src/components/settings/SoundSettingsDrawer.tsx';
let text = fs.readFileSync(drawerPath, 'utf8');
text = text.replace('type= range', 'type="range"');
text = text.replace('type=checkbox', 'type="checkbox"');
text = text.replace('type=checkbox', 'type="checkbox"');
fs.writeFileSync(drawerPath, text, 'utf8');
console.log('SoundSettingsDrawer.tsx input types fixed cleanly!');
