# Tool Access Model

## Overview

The Tool Access Model defines how different bot families access and utilize external AI tools within the platform. It provides a structured approach to permission management, ensuring bots can only access tools they're authorized to use.

## Bot Family to Tool Mapping

### Research Bots

- **Primary Tools**: Gemini, Perplexity
- **Secondary Tools**: Claude, ChatGPT
- **Use Cases**: Research analysis, content summarization, trend analysis

### Video Production Bots

- **Primary Tools**: Runway, Kling
- **Secondary Tools**: Genmo, Pika
- **Use Cases**: Video generation, video editing, motion effects

### Avatar Animation Bots

- **Primary Tools**: LivePortrait, D-ID
- **Secondary Tools**: Heygen, Wav2Lip
- **Use Cases**: Avatar lip-sync, facial animation, expression transfer

### Voice Generation Bots

- **Primary Tools**: ElevenLabs
- **Secondary Tools**: Mubert, Soundraw
- **Use Cases**: Voice synthesis, voice cloning, music generation

### QA Automation Bots

- **Primary Tools**: Playwright
- **Secondary Tools**: Puppeteer
- **Use Cases**: Browser automation, visual testing, regression detection

## Access Levels

| Level | Description | Capabilities |
|-------|-------------|--------------|
| read | Read-only access | Query tool status, view outputs |
| execute | Standard execution | Run tool with approved inputs |
| admin | Full control | Modify tool configuration, manage credentials |

## Permission Structure

```
json
{
  "botFamily": "research-bot",
  "allowedTools": ["gemini", "perplexity"],
  "maxCallsPerHour": 100,
  "requiresApproval": false,
  "budgetAllocation": 50.00
}
```

## Rate Limits

Each bot family has configured rate limits:
- **Requests per minute**: Max requests allowed per minute
- **Requests per hour**: Total requests allowed per hour  
- **Concurrent requests**: Max parallel requests

## Approval Workflow

For expensive operations (high cost tools):
1. Bot requests tool access
2. System checks budget availability
3. If within budget: Execute request
4. If exceeding budget: Route to approval queue
5. Admin reviews and approves/denies

## Connected Systems

- Tool Orchestrator
- Permission Registry
- Cost Control System
- Audit Logging

## Not Responsible For

- Tool implementation
- Bot logic
- Content policy
- User authentication
