# TMI/BernoutGlobal Development Setup

**Environment:** Clean, production-focused VS Code + platform stack for operational 100%.

---

## Part 1: VS Code Extensions

### Required Extensions (Install in Order)

#### 1. ESLint

- **Purpose:** Catch code mistakes early, keep files consistent, prevent broken imports.
- **ID:** `dbaeumer.vscode-eslint`
- **Status:** ✅ Installed

#### 2. Prettier

- **Purpose:** Format everything consistently, reduce merge conflicts, cleaner codebase.
- **ID:** `esbenp.prettier-vscode`
- **Status:** ✅ Installed

#### 3. GitLens

- **Purpose:** Track who changed what, inspect file history, compare versions.
- **ID:** `eamodio.gitlens`
- **Status:** ✅ Installed

#### 4. Thunder Client

- **Purpose:** Test auth routes, invites, promos, tickets.
- **ID:** `rangav.vscode-thunder-client`
- **Status:** ✅ Installed

#### 5. GitHub Copilot

- **Purpose:** Scoped code help, patching, refactors.
- **ID:** `GitHub.copilot`
- **Status:** ✅ Installed (or keep active)

#### 6. Prisma Extension

- **Purpose:** Database schema visibility, autocomplete, model checking.
- **ID:** `Prisma.prisma`
- **Status:** ✅ Installed (Prisma is in use)

#### 7. Blackbox AI

- **Purpose:** Fast scaffolding, route generation, admin page generation.
- **ID:** `Blackbox-ai.blackbox`
- **Status:** ✅ Keep

### Optional Extensions (Recommended if Useful)

- **Tailwind CSS IntelliSense** - For CSS class intelligence
- **Error Lens** - Inline error diagnostics
- **Path Intellisense** - Auto-complete file paths
- **DotENV** - .env file syntax highlighting
- **YAML** - YAML schema validation
- **Docker** - Docker file support

### Do NOT Install

- Random video player extensions
- Random WebM/AVI preview extensions
- Random browser launcher extensions
- Unknown low-download extensions

---

## Part 2: Runtime Stack (App, Not VS Code)

These tools go in your application runtime, not as VS Code extensions:

### Live Video Chat

- **WebRTC** - Primary live video/audio engine
- **Use for:** fan ↔ artist calls, performer meet-and-greets, backstage rooms, venue live rooms, co-host rooms, admin live observatory
- **Features:** mute/unmute, camera switching, screen share, room moderation, recording, bitrate diagnostics

### Bot Video Generation

- **FFmpeg** - Video/audio processing, motion rendering, compression
- **OpenCV** - Visual analysis, motion loops, portrait animation, facial movement

### Email System

- **Resend** or **SendGrid** - SMTP/API email delivery
- **Use for:** invites, password recovery, promo codes, gifted memberships, ticket delivery, receipts, notifications

### Live Chat System

- **Socket.IO** - Real-time bidirectional communication
- **Use for:** DMs, family invites, fan chat, performer chat, room chat, cypher chat, support chat

### Admin Multi-View Observatory (PiP)

- **HLS.js** - HTTP Live Streaming
- **WebRTC** - Multi-camera switching
- **Features:** multi-camera admin view, PiP windows, bot observation, room observation, host observation

### Database ORM

- **Prisma** (in use) - Type-safe database access

### Billing & Ticketing

- **Stripe** - Payment processing, subscriptions, billing
- **QR Code Library** - Ticketing QR generation
- **PDF Library** - Venue ticket printing

---

## Part 3: VS Code Workspace Configuration

### `.vscode/extensions.json`

Specifies recommended extensions for all team members.

### `.vscode/settings.json`

Enforces:

- Format on save
- ESLint autofix
- Import organization
- TypeScript validation

**This keeps every machine aligned.**

---

## Part 4: Repository Structure

### Main Workspace

```
c:\Users\Admin\Documents\BerntoutGlobal XXL\
├── tmi-platform/              # Primary codebase
│   ├── apps/
│   │   ├── api/               # API server (Node/Express)
│   │   └── ...
│   ├── packages/
│   │   ├── db/
│   │   │   └── prisma/        # Database schemas
│   │   └── ...
│   └── package.json
├── tmi-platform-prfix/        # Prefix variant
├── tmi-platform.bak/          # Backup
├── DEVELOPMENT_SETUP.md       # This file
└── ...
```

---

## Part 5: Environment Variables

### Create `.env.local` in workspace root

```env
# Database
DATABASE_URL=your_postgres_connection_string

# API
API_URL=http://localhost:3000
API_PORT=3000

# WebRTC (when implemented)
WEBRTC_ICE_SERVERS=stun:stun.l.google.com:19302

# Socket.IO (when implemented)
SOCKET_IO_SERVER=http://localhost:3001

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@tmi.local

# Billing (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# AI Services (if applicable)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Admin Auth
ADMIN_SESSION_SECRET=your_admin_session_secret
```

---

## Part 6: Development Server Boot

### Start Development Environment

#### 1. Install Dependencies

```bash
cd tmi-platform
pnpm install
```

#### 2. Database Migrations

```bash
cd packages/db
pnpm prisma:migrate
pnpm prisma:generate
```

#### 3. Build Packages

```bash
cd ../..
pnpm build
```

#### 4. Start API Server

```bash
cd apps/api
pnpm dev
```

#### 5. Start Web App (if separate)

```bash
cd ../web  # or wherever web app is
pnpm dev
```

---

## Part 7: Build Order

**For production builds:**

1. **Lint and type-check**

   ```bash
   pnpm lint
   pnpm type-check
   ```

2. **Run migrations**

   ```bash
   pnpm prisma:migrate
   ```

3. **Build all packages**

   ```bash
   pnpm build
   ```

4. **Build API**

   ```bash
   cd apps/api
   pnpm build
   ```

5. **Build web app**
   ```bash
   cd apps/web  # or web app location
   pnpm build
   ```

---

## Part 8: Audit Order

**Before deployment, run audits in this order:**

1. **Governance Layer Integrity** (Gemini audit)
   - Chain-of-command reporting: Bot → Supervisor → Department Lead → MC → Big Ace
   - Every bot has directives, objectives, goals, tasks, checkpoints, achievements, reports
   - MC approval layer functional
   - Big Ace visibility present

2. **Bot Reporting Integrity**
   - Reports include: department, assigned route, assigned engine, assigned task, risk level, MC status, Big Ace visibility
   - Chain-of-command escalation working

3. **Visual Queue Integrity**
   - Queue state tracking: building → queued → rendering → done/failed
   - Retry logic functional
   - Archive/recycle/retirement lifecycle working

4. **Visual Lifecycle Integrity**
   - Archive → Recycle → Retirement → Upgrade decisions firing correctly
   - Asset state transitions logged

5. **Admin Observability Integrity**
   - Governance card visible on all 6 surfaces: /admin/bots, /admin/operations, /admin/analytics, /admin/diagnostics, /admin/visual-command, /admin/big-ace/overview
   - Main /admin hub includes governance card

6. **Homepage Hero Truth**
   - Orbital shell renders correctly
   - Music zine banner displays
   - Confetti animations trigger
   - Neon overlays apply
   - Top 10 orbit loads
   - Crown center positioned
   - Article click-through works
   - Timing logic correct

7. **Bot Replacement System**
   - Human replacement queue transfers rank, articles, visuals, chat history, room slots cleanly

8. **Auth Hardening**
   - Admin auth enforced
   - Session monitoring active
   - Role-based access control working

---

## Part 9: Test Order

### Critical-Path Testing (After Audits Pass)

1. **Governance tests**
   - Bot assignment to department
   - Directive enforcement
   - Goal/task/checkpoint/achievement tracking
   - MC authority decisions
   - Big Ace visibility

2. **Bot workflow tests**
   - Bot spawn
   - Task assignment
   - Task completion
   - Failure reporting
   - Escalation to MC

3. **Visual pipeline tests**
   - Asset generation
   - Queue state transitions
   - Archive/recycle/retire decisions
   - Upgrade triggers

4. **Admin observability tests**
   - Governance card rendering
   - Real-time status updates
   - Quick-link navigation

### Full Testing

1. **Unit tests** - All engines
2. **Integration tests** - Governance chain
3. **E2E tests** - Admin surfaces
4. **Load tests** - Bot fleet behavior
5. **Security tests** - Admin auth, session management

---

## Part 10: Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript check

# Database
pnpm prisma:migrate   # Run migrations
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open Prisma Studio

# Testing (when ready)
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:e2e         # E2E tests only

# Auditing
pnpm audit            # Audit npm packages
pnpm audit:security   # Security audit only
```

---

## Part 11: Production Deployment Checklist

Before deploying:

- [ ] All audits passed
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security hardening complete
- [ ] Bot governance verified
- [ ] Admin observability verified
- [ ] Live video stack deployed
- [ ] Socket.IO chat deployed
- [ ] Email system live
- [ ] Billing system live
- [ ] No console errors
- [ ] No warnings
- [ ] Performance acceptable

---

## Part 12: When to Use Thunder Client

Use Thunder Client to test:

1. **Auth routes** - Login, token refresh, logout
2. **Invite routes** - Send/accept/reject invites
3. **Promo routes** - Validate/redeem promo codes
4. **Ticket routes** - Purchase, refund, transfer
5. **Bot admin routes** - Governance, directive, goal, task routes
6. **Observable routes** - Real-time status checks

**Do not use for:**

- Testing UI (use Next.js dev server)
- Testing live video (use WebRTC test harness)
- Testing chat (use Socket.IO test client)

---

## Part 13: Workspace Truth

This setup ensures:

✅ Every machine runs the same extensions  
✅ Code is formatted consistently  
✅ Linting catches errors early  
✅ Database schemas are always in sync  
✅ API testing is fast  
✅ Git history is visible  
✅ No random extensions cluttering the repo

---

## Part 14: Next Steps

1. **Environment stable** ✅ (VS Code clean, extensions installed)
2. **Workspace configuration saved** ✅ (.vscode files created)
3. **Gemini audit** → **NEXT** (Do not skip)
4. Fix 8 remaining gaps (after audit passes)
5. Critical-path testing
6. Full testing
7. Production deployment

---

**Last Updated:** May 9, 2026  
**Status:** Ready for Gemini audit
