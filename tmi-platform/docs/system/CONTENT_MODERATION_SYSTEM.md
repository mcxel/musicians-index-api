# CONTENT_MODERATION_SYSTEM.md
## Content Moderation — Keeping TMI Safe for All Artists
### BerntoutGlobal XXL / The Musician's Index

---

## THREE-LAYER MODERATION

```
Layer 1: Automated (content-moderation-bot)
  → Chat message scanning
  → Username/bio profanity filter
  → Beat/media title filter
  → Image content detection (uploaded avatars/banners)

Layer 2: Community (trusted moderators)
  → Review flagged content
  → Issue warnings, mutes, kicks
  → Escalate serious violations to Big Ace

Layer 3: Big Ace (final authority)
  → Permanent bans
  → Emergency room shutdowns
  → Policy enforcement
```

---

## CONTENT POLICIES (Summary)

Allowed on TMI:
✅ All genres and styles of original music
✅ Competitive rap battles (artistic content)
✅ Adult language in artistic context (age 18+ flagged rooms)
✅ Self-promotion, fan engagement

Not Allowed (platform removal):
❌ Doxxing or revealing personal info
❌ Coordinated harassment campaigns
❌ CSAM (immediate law enforcement report)
❌ Non-consensual intimate content
❌ Impersonation of real artists
❌ Copyright-infringing uploads (DMCA process)

---

## FLAGGING FLOW

```
User taps "Report" on content
     ↓
Report form: choose category + optional note
     ↓
Write to reports table
     ↓
content-moderation-bot reviews based on severity
     ↓
P0 (CSAM/violence): auto-remove + escalate immediately
P1: Flag for human review within 1 hour
P2: Add to review queue (24h SLA)
P3: Log only
```

---

## DMCA TAKEDOWN PROCESS

1. Rights holder submits takedown via `/report?type=dmca`
2. Platform team reviews within 72 hours
3. If valid: content removed, artist notified
4. Artist has 14 days to counter-notice
5. If no counter: content stays removed
6. If counter: rights holder has 14 days to sue or content restored
