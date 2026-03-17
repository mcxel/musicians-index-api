# BerntoutGlobal XXL - Onboarding Guide

## Welcome to BerntoutGlobal XXL

BerntoutGlobal XXL is a comprehensive platform for managing music events, artist profiles, sponsor systems, and display kiosks. This guide will help you get started with development, deployment, and operations.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Architecture](#project-architecture)
3. [Development Setup](#development-setup)
4. [Running the Application](#running-the-application)
5. [Testing & Verification](#testing--verification)
6. [Deployment](#deployment)
7. [Feature Modules](#feature-modules)
8. [Troubleshooting](#troubleshooting)
9. [Support](#support)

---

## Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| pnpm | 8+ | Package manager |
| Python | 3.10+ | For runtime server |
| PostgreSQL | 14+ | Database |

### 5-Minute Setup

```
bash
# 1. Clone and install dependencies
cd tmi-platform
pnpm install

# 2. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local

# 3. Start the runtime server (Terminal 1)
python api_server.py

# 4. Start the Next.js dev server (Terminal 2)
pnpm -C apps/web dev

# 5. Verify everything works
# Open: http://localhost:3000
```

---

## Project Architecture

### Overview

```
BerntoutGlobal XXL/
├── tmi-platform/              # Main monorepo
│   ├── apps/
│   │   ├── api/             # NestJS API server
│   │   └── web/             # Next.js 14 web app
│   ├── packages/             # Shared packages
│   │   ├── core-domain/      # Business logic
│   │   ├── db/               # Prisma database
│   │   └── ui/               # Shared UI components
│   └── scripts/               # Automation scripts
├── program/                   # Animation & visual modules
│   ├── animations/           # Visual FX (VideoFrame, Neon, Shimmer)
│   └── sponsors/             # Sponsor display system
├── server/                    # Legacy server routes
└── public/                   # Static assets
```

### Key Technologies

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Payments | Stripe |
| Runtime | Python (api_server.py) |

---

## Development Setup

### Environment Variables

Create the following files with your configuration:

#### apps/web/.env.local

```
env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
RUNTIME_STATUS_BASE_URL=http://localhost:5000

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/berntout
```

#### apps/api/.env.local

```
env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/berntout

# Auth
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

### Database Setup

```
bash
# Generate Prisma client
pnpm -C apps/api prisma generate

# Push schema to database
pnpm -C apps/api prisma db push

# (Optional) Seed with sample data
pnpm -C apps/api prisma db seed
```

---

## Running the Application

### Development Mode

**Terminal 1 - Runtime Server:**
```
bash
python api_server.py
```

**Terminal 2 - Web App:**
```
bash
pnpm -C tmi-platform/apps/web dev
```

The web app will be available at `http://localhost:3000`

### Kiosk/HUD Mode

For display kiosk or wallboard:

```
http://localhost:3000/hud?mode=kiosk&module=xxl
http://localhost:3000/hud?mode=wallboard&rotate=10
```

### Available Routes

| Route | Description |
|-------|-------------|
| `/` | Main landing page |
| `/dashboard` | User dashboard |
| `/hud` | Kiosk HUD display |
| `/streamwin` | StreamWin module |
| `/submit` | Content submission |
| `/admin` | Admin panel |
| `/api/healthz` | Health check |
| `/api/readyz` | Readiness check |
| `/api/internal/runtime/status` | Runtime status |

---

## Testing & Verification

### Build Verification

```
bash
# Run the gates script
powershell -ExecutionPolicy Bypass -File .\tmi-platform\scripts\gates.ps1
```

Expected output:
- Gate A (TypeCheck): PASS
- Gate B (Lint): PASS  
- Gate C (Build): PASS

### Runtime Health Check

```
powershell
# Test runtime endpoint
irm http://localhost:3000/api/internal/runtime/status | ConvertTo-Json -Depth 10
```

### Kiosk Behavior Test

1. Open `http://localhost:3000/hud?mode=kiosk&module=xxl`
2. Stop the Python runtime server
3. Verify: HUD shows "OFFLINE" with countdown
4. Restart the Python server
5. Verify: Countdown cancels immediately

---

## Deployment

### Production Build

```
bash
# Build the Next.js app
pnpm -C tmi-platform/apps/web build
```

### Hosting Options

#### Cloudflare Pages
- Deploy `apps/web` output
- Set environment variables in Cloudflare dashboard
- Configure cache rules for static assets

#### IONOS VPS
- Use nginx reverse proxy
- Set up systemd service for Python runtime
- Configure SSL/TLS certificates

#### Inno Setup (Windows Installer)
- Use `tmi-platform/install/installer.iss`
- Configure paths and shortcuts

---

## Feature Modules

### Sponsor System

Location: `program/sponsors/`

Components:
- `SponsorTile` - Individual sponsor display
- `SponsorBadge` - Compact sponsor indicator
- `SponsorStrip` - Scrolling sponsor banner

### Animation System

Location: `program/animations/`

Effects:
- `VideoFrameFX` - Video frame effects
- `NeonPulse` - Neon glow animations
- `ShimmerBorder` - Shimmer border effect

### Arena System

Location: `tmi-platform/apps/web/src/components/arena/`

Features:
- `ArenaViewer` - Main arena display
- `AvatarSprite` - Avatar rendering
- `SeatMap` - Interactive seating

### Law Bubble

Location: `tmi-platform/apps/web/src/components/law-bubble/`

Features:
- Payment integration
- Question submission
- Wallet management

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|-----------|
| Build fails with module not found | Check `@program/*` path in `tsconfig.json` - should be `../../../program/*` |
| Runtime status shows offline | Ensure Python api_server.py is running |
| Kiosk doesn't reload | Check offline backoff settings in HUD component |
| Auth not working | Verify NEXTAUTH_SECRET is set |

### Gates Script

Run for diagnostic information:
```
bash
powershell -ExecutionPolicy Bypass -File .\tmi-platform\scripts\gates.ps1
```

---

## Support

### Key Contacts

- **Admin Access**: Contact system administrator
- **Stripe Issues**: Check dashboard.stripe.com
- **Database Issues**: Check PostgreSQL logs

### Documentation

- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Security Policy](SECURITY.md)

---

## License

Copyright © 2024 BerntoutGlobal XXL. All rights reserved.
