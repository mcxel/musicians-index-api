# Tool Orchestration

## Overview

The Tool Orchestration system provides centralized management for external AI tools and services that bots can access. It ensures controlled access, health monitoring, fallback handling, and cost management for all tool interactions.

## Purpose

- Provide bots with controlled access to approved external AI tools
- Enforce permission-based tool access by bot family
- Monitor tool health and trigger fallbacks when needed
- Control and track costs associated with tool usage
- Maintain audit logs of all tool interactions

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Bot Layer                            │
│  (research-bot, video-bot, avatar-bot, etc.)          │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Tool Orchestrator                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  Registry    │ │ Permissions  │ │   Runner     │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   Health    │ │   Fallback   │ │    Cost      │    │
│  │   Monitor   │ │   Handler    │ │   Control    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              External AI Tools                          │
│  Runway │ Kling │ Gemini │ Playwright │ ElevenLabs    │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### Tool Registry

Maintains catalog of all available tools with metadata:
- Name, category, capabilities
- Authentication requirements
- Rate limits and quotas
- Performance characteristics
- Output format specifications

### Permission System

Enforces bot family access controls:
- Bot family to tool mappings
- Per-tool rate limits per bot family
- Approval requirements for expensive operations
- Usage quotas and budgets

### Tool Runner

Executes tool requests with:
- Input validation
- Output verification
- Error handling
- Result transformation
- Execution timing

### Health Monitor

Tracks tool availability:
- Periodic health checks
- Response time monitoring
- Error rate tracking
- Automatic fallback triggering

### Fallback Handler

Manages tool redundancy:
- Primary/fallback tool chains
- Automatic failover on failure
- Recovery attempt scheduling
- Fallback success tracking

### Cost Controller

Enforces budget limits:
- Daily/hourly cost tracking
- Per-task cost limits
- Budget exhaustion handling
- Cost reporting and alerts

## Supported Tool Categories

| Category | Tools | Use Case |
|----------|-------|----------|
| video_generation | Runway, Kling, Genmo, Pika | Video content creation |
| image_generation | Midjourney, DALL-E, Stable Diffusion | Image creation |
| avatar_animation | LivePortrait, D-ID, Heygen | Avatar lip-sync & animation |
| voice_generation | ElevenLabs, Mubert, Soundraw | Voice synthesis |
| research | Gemini, Perplexity, Claude | Research & analysis |
| browser_automation | Playwright, Puppeteer | QA & testing |
| workflow_automation | Custom workflows | Multi-step automation |
| security | Approved security tools | Security scanning |

## Usage Example

```
typescript
import { ToolOrchestrator } from '@berntout/tool-orchestrator';

const orchestrator = new ToolOrchestrator();

// Execute a tool
const result = await orchestrator.execute({
  botFamily: 'research-bot',
  toolName: 'gemini',
  input: { query: 'Analyze music trends 2024' },
  context: { sessionId: 'abc123' }
});

// Check tool health
const health = await orchestrator.getToolHealth('runway');
```

## Connected Modules

- Bot systems (all bot families)
- Self-healing system (health events)
- Cost tracking (budget enforcement)
- Audit logging (compliance)

## Not Responsible For

- Tool API implementation
- Bot logic execution
- Content policy enforcement
- User authentication
