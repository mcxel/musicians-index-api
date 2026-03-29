# FAMILY_KID_SAFETY_RULES.md
## Hard-Coded Safety Rules — Communication, Performer, and Commerce
### BerntoutGlobal XXL / The Musician's Index

These rules are NON-NEGOTIABLE. They must be enforced in middleware, API, and WebSocket layers.

---

## COMMUNICATION MATRIX

```
ALLOWED:
  kid fan       ↔  kid fan              ✅
  kid fan       ↔  kid performer        ✅
  kid performer ↔  kid performer        ✅
  adult         ↔  adult                ✅
  parent/guardian ↔ linked child        ✅ (family account link required)

BLOCKED (hard-coded, not configurable):
  adult (unrelated) → kid account       ❌ BLOCKED
  kid account → adult (unrelated)       ❌ BLOCKED
  sponsor/brand → kid account directly  ❌ BLOCKED
  advertiser → kid account directly     ❌ BLOCKED
```

### Implementation

```typescript
// middleware/messageSafety.ts
export async function canSendMessage(senderId: string, recipientId: string): Promise<boolean> {
  const [sender, recipient] = await Promise.all([
    getUserWithAgeGroup(senderId),
    getUserWithAgeGroup(recipientId),
  ]);

  if (sender.isKid && recipient.isKid) return true;
  if (!sender.isKid && !recipient.isKid) return true;

  // The only adult↔kid exception: verified parent/guardian ↔ their child
  if (sender.isParent && recipient.isLinkedChild(sender.id)) return true;
  if (recipient.isParent && sender.isLinkedChild(recipient.id)) return true;

  return false;  // ALL other cross-age-group messaging BLOCKED
}

// Same check must run on:
// POST /api/messages
// WebSocket room:chat
// WebSocket direct message
// Friend request API
```

---

## KID PERFORMER RULES

```
1. Kid performer account requires verified parent approval
   - API: POST /api/family/accounts/:childId/performer → status = 'pending_approval'
   - Parent must explicitly call PUT /api/family/accounts/:childId/performer { approved: true }
   - No child performer account is active until parent approves

2. Default permissions for kid performer (all off by default, parent enables):
   - canUploadMedia: false
   - canBePublic: false
   - canReceiveMessages: false  (kid-to-kid only if enabled)
   - canJoinEvents: false
   - canMakePurchases: false

3. Kid performer rooms:
   - Only accessible in kid-safe room pool
   - No adult audience unless parent explicitly allows
   - Audience chat visible only to kid accounts
   - Room moderation: content-moderation-bot runs at highest sensitivity

4. Kid performer discovery:
   - Never appears in adult discovery feeds
   - Only appears in kid-safe lobby wall
   - LIVE badge still shows (discovery-first honored within kid pool)
```

---

## PARENT CONTROLS

```
Parent can at any time:
- Enable/disable performer mode
- Enable/disable public profile visibility
- Enable/disable media uploads
- Enable/disable messaging (always kid-to-kid only)
- Set spending limits for credits/purchases
- Review full activity log
- Emergency lock: immediately suspend all kid account activity

Parent is notified when:
- Child receives a message (can review before child sees if parent approval mode on)
- Child's room starts (optional)
- Purchase is attempted (if spending limit mode on)
- Child receives a new friend request
- Any content moderation flag is raised on child's account
```

---

## AUDIT REQUIREMENTS

```
Every communication involving a child account must be logged:
- message sent (with age group of both parties)
- room join by child account
- performer mode change
- parent approval/denial
- purchase attempt
- moderation flag

Stored in: moderation_audit_log table
Retention: 365 days
Access: Big Ace + parent of the child account
```
