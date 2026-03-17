# Tool Orchestrator

Central system for bots to access approved external AI tools through controlled adapters, permissions, verification, fallbacks, logging, and cost controls.

## Purpose

The Tool Orchestrator provides a unified interface for bots to safely use external AI tools including:
- Video generation (Runway, Kling, Luma)
- Image generation (Midjourney, Krea)
- Avatar animation (LivePortrait, D-ID, HeyGen)
- Voice generation (ElevenLabs, Mubert)
- Research (Gemini, Perplexity, Claude)
- Browser automation (Playwright, Puppeteer)
- Workflow automation (n8n, Zapier, Axiom)

## Architecture

- `src/engine.ts` - Main orchestrator engine
- `src/types.ts` - Type definitions
- `src/events.ts` - Event system
- `src/tool-registry.ts` - Tool registration and lookup

## Usage

```
typescript
import { toolOrchestrator } from '@tmi/tool-orchestrator';

const result = await toolOrchestrator.execute({
  tool: 'runway',
  bot: 'video-bots',
  task: 'generate_video',
  input: { prompt: '...' }
});
```

## Rules

- All tool use must be logged
- All tool use must support verification and fallback
- High-risk exports must be approval-gated
- No scraping-evasion patterns
- No CAPTCHA bypass
- No proxy rotation
- Official API / approved browser automation only
