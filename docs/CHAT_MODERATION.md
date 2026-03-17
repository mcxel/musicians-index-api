# CHAT MODERATION

## Overview

The Chat Moderation system ensures safe, engaging conversations in live rooms through automated filters and manual controls.

---

## Moderation Layers

### Layer 1: Auto-Filter
- Spam detection
- Profanity filter
- Link blocking
- Emoji spam limit
- Repeat message throttle

### Layer 2: Bot-Assisted
- Bot moderators
- Sentiment analysis
- Escalation triggers
- Pattern detection

### Layer 3: Human Moderator
- Manual timeout
- Message deletion
- User ban
- Slow mode toggle

---

## Moderation Rules

| Rule | Threshold | Action |
|------|-----------|--------|
| rapid-fire | 5 msg/sec | slow mode |
| repeat-msg | 3x same | delete |
| caps-lock | 70% caps | warn |
| link-only | >50% links | delete |
| banned-word | any | delete + warn |

---

## Moderation Modes

| Mode | Filters | Speed |
|------|---------|-------|
| strict | all | instant |
| standard | most | 1s delay |
| relaxed | basic | 2s delay |
| open | none | none |

---

## Files Reference

- `data/chat/moderation-rules.json` - Rule definitions
- `data/bots/registry.json` - Bot configs
