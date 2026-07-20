# TMI Mobile Deployment & Server URL Configuration

## Server URL Environments
The native mobile shell connects to live production endpoints via `capacitor.config.ts`:

- **Production**: `https://themusiciansindex.com`
- **Staging**: `https://staging.themusiciansindex.com`
- **Development**: `http://10.0.2.2:3100` (Android emulator)

## Switching Environments Before Capacitor Sync
Set `CAPACITOR_ENV` environment variable before running sync:
```bash
CAPACITOR_ENV=production npx cap sync
```

## Production Endpoints & Assets
- Privacy Policy: `https://themusiciansindex.com/privacy`
- Terms of Service: `https://themusiciansindex.com/terms`
- DMCA Policy: `https://themusiciansindex.com/dmca`
- About Page: `https://themusiciansindex.com/about`
- Support / Contact: `https://themusiciansindex.com/contact`
- Mobile Ads Declaration: `https://themusiciansindex.com/app-ads.txt`
