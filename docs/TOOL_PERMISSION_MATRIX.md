# Tool Permission Matrix

## Overview

The Tool Permission Matrix provides a comprehensive view of which bot families have access to which tools, along with specific constraints and requirements.

## Matrix Overview

| Bot Family | Tool Category | Primary Tools | Secondary Tools | Max Calls/Hour | Approval Required |
|------------|---------------|---------------|-----------------|----------------|------------------|
| research-bot | research | gemini, perplexity | claude, chatgpt | 500 | No |
| video-bot | video_generation | runway, kling | genmo, pika | 50 | Yes |
| avatar-bot | avatar_animation | liveportrait, d-id | heygen | 100 | No |
| audio-bot | voice_generation | elevenlabs | mubert, soundraw | 200 | No |
| workflow-bot | workflow_automation | custom | - | 1000 | No |
| browser-bot | browser_automation | playwright | puppeteer | 300 | No |
| security-bot | security | approved-tools | - | 50 | Yes |

## Permission Rules

### Primary Tool Access

- Each bot family has designated primary tools
- Primary tools are always available when budget permits
- No approval required for primary tool usage

### Secondary Tool Access

- Secondary tools available as fallbacks
- Require primary tool to fail first
- Lower priority in resource allocation

### Approval Requirements

Tools requiring explicit approval:
- Video generation tools (high cost)
- Security scanning tools (sensitive)
- Premium tier tools

## Access Control Rules

1. **Bot Family Validation**: Verify bot belongs to authorized family
2. **Tool Availability**: Check tool is online and healthy
3. **Budget Check**: Verify sufficient budget for operation
4. **Rate Limit Check**: Ensure within per-hour limits
5. **Approval Check**: Verify approval if required

## Revocation Conditions

Bot access may be revoked for:
- Excessive cost overruns
- Policy violations
- Security incidents
- Performance abuse

## Audit Requirements

All permission checks are logged:
- Timestamp
- Bot family
- Tool requested
- Decision (approved/denied)
- Reason for denial
