# Tool Fallback Rules

## Overview

Tool Fallback Rules define the hierarchy and logic for automatically switching to alternative tools when primary tools fail or become unavailable.

## Fallback Chain Structure

Each tool has a defined fallback chain:
1. **Primary**: First-choice tool
2. **Secondary**: Backup when primary fails
3. **Tertiary**: Final fallback option

## Fallback Triggers

| Trigger Condition | Action |
|------------------|--------|
| Tool offline | Switch to fallback |
| Timeout exceeded | Switch to fallback |
| Error rate >10% | Switch to fallback |
| Auth failure | Switch to fallback |
| Rate limit hit | Switch to fallback |

## Fallback Configuration

```
json
{
  "tool": "runway",
  "fallback": "kling",
  "fallbackFallback": "genmo",
  "maxRetries": 3,
  "retryDelay": 1000
}
```

## Fallback Decision Logic

1. Detect primary tool failure
2. Check if fallback is available and healthy
3. If yes: route request to fallback
4. If no: check tertiary fallback
5. If all fail: return error with retry suggestion

## Fallback Logging

All fallback events are logged:
- Timestamp
- Original tool
- Fallback tool used
- Reason for fallback
- Success/failure of fallback attempt

## Connected Systems

- Tool Health Monitoring
- Tool Registry
- Retry Logic
- Audit Logging
