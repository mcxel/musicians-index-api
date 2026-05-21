# TMI PACK 31 — SCAFFOLD + FIX PACK
## Claude → Blackbox → Copilot → Gemini Handoff
### BerntoutGlobal XXL / The Musician's Index

---

## WHAT THIS PACK DOES

Pack 31 is the bridge between Claude's architecture and Blackbox's repo integration.

| Folder | Contents |
|---|---|
| `fix/` | 6 corrected files (onboarding + dashboard) — corrupted by append edits |
| `scaffold/` | 98 clean page.tsx files for all platform systems |
| `prompts/` | Copy-paste prompts for Blackbox, Copilot, and Gemini |

---

## THE IMMEDIATE FIX (do this first)

The onboarding pages have corrupted code from repeated appends. The fix:

```powershell
# In PowerShell as Admin:
taskkill /F /IM node.exe

# Delete corrupted folders:
Remove-Item -Recurse -Force "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\onboarding\admin"
Remove-Item -Recurse -Force "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\onboarding\artist"
Remove-Item -Recurse -Force "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\onboarding\fan"

# Copy fix files in:
# (Blackbox can do this step — paste BLACKBOX_MASTER_PROMPT.md)

# Then clear cache and restart:
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web"
Remove-Item -Recurse -Force .next
pnpm dev
```

---

## THE AI WORKFLOW

```
1. Give fix/ files to Blackbox → it drops them into the repo
2. Give scaffold/ files to Blackbox → it creates all platform pages
3. Give COPILOT_WIRING_PROMPT.md to Copilot → it wires chains
4. Give GEMINI_AUDIT_PROMPT.md to Gemini → it audits after each chain
5. You → visual check in browser
```

---

## SCAFFOLD COVERS

- Profile system (artist + fan create/edit/public)
- Stations system (10 pages — slug, schedule, live, archive, sponsors, etc.)
- Article system (list + detail with station link)
- Magazine (5 pages)
- Lobby/Live (7 pages)
- Contest (8 pages)
- Sponsors/Advertisers/Ads/Stores (15 pages)
- Earnings/Coaching (8 pages)
- Clips/Media (7 pages)
- Commerce scaffold (disabled by feature flag, 7 pages)
- Config files (feature-flags.ts, module-registry.ts, coaching-rules.ts)

---

## KEY RULES ENFORCED IN SCAFFOLD

- ⚡ Artist articles ALWAYS link to artist station
- ⚡ "Stations" not "Channels" in all UI
- ⚡ Coaching sticky notes on artist dashboard (thank your sponsor!)
- ⚡ Future commerce feature-flagged OFF but scaffolded
- ⚡ Clips can be saved/shared to Twitch/YouTube/external
- ⚡ Local store sponsors local artist loop built in
- ⚡ Earnings panel visible on artist dashboard immediately

*BerntoutGlobal LLC — "This is your stage, be original."*
