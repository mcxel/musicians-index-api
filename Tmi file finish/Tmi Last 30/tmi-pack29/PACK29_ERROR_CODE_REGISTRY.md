# PACK29_ERROR_CODE_REGISTRY.md
## Every Error Code — Consistent Frontend + Backend Error Handling
### BerntoutGlobal XXL / The Musician's Index

Format: { error: 'error_code', message: 'Human-readable text', status: HTTP_STATUS }

---

## AUTH ERRORS (401, 403)

```
unauthorized          401  No valid session token
forbidden             403  Valid session but insufficient permissions
token_expired         401  JWT expired — client should refresh
role_required         403  Action requires specific role (ARTIST, ADMIN, etc.)
```

---

## CAMPAIGN / ADVERTISER ERRORS (400, 403, 409, 429)

```
advertiser_exists      409  User already has advertiser account
campaign_not_found     404  Campaign ID not found or not owned by requester
invalid_dates          400  startDate must be in future, endDate > startDate
invalid_surfaces       400  Unknown surface type in surfaces array
budget_too_low         400  Budget below minimum for selected package
campaign_already_active 400  Cannot cancel/delete a running campaign
creative_not_approved  403  Campaign cannot go active — creative pending review
invalid_creative_dims  400  Image not 1200×628, or video > 30 seconds
file_too_large         400  Creative file exceeds 10MB
unsupported_format     400  Only JPG/PNG/MP4 accepted
discount_requires_approval 403  Discount > 10% requires Big Ace approval
exclusivity_requires_admin 403  Exclusivity clause requires Big Ace signature
slot_not_available     409  Requested slot already reserved for that date range
slot_hold_expired      409  Tentative hold expired — must re-reserve
brand_safety_blocked   403  Creative rejected by brand safety rules
```

---

## PARTY LOBBY ERRORS (400, 403, 404, 409)

```
party_not_found        404  Party ID not found
invalid_invite_code    403  Wrong code for private party
party_full             409  Party already has max 12 members
party_disbanded        404  Party was disbanded
not_host_or_cohost     403  Action requires host or co-host role
party_child_blocked    403  Age-group mismatch — kid cannot join adult party
```

---

## GAME ERRORS (400, 404, 409)

```
session_not_found      404  Game session ID not found
session_full           409  Max players already joined
already_joined         409  User is already in this session
session_ended          400  Cannot join a completed session
invalid_game_type      400  Unknown game type
not_in_session         403  Action requires being a player in this session
game_not_started       400  Cannot answer — game hasn't started yet
```

---

## SAFETY / KID ERRORS (403)

```
kid_age_group_blocked  403  Adult cannot message/join party with child account
performer_not_approved 403  Kid performer requires verified parent approval
purchase_blocked_child 403  Child account cannot make purchases without parent permission
```

---

## TICKET / ANTI-BOT ERRORS (400, 429)

```
bot_detected           400  Turnstile verification failed
velocity_exceeded      429  Too many purchase attempts — slow down
limit_exceeded         429  Max 8 tickets per buyer per event exceeded
```

---

## GENERAL ERRORS

```
not_found              404  Resource not found
validation_error       400  Request body validation failed
internal_error         500  Unexpected server error (log to Sentry)
service_unavailable    503  Dependency (Redis, Stripe) temporarily down
rate_limited           429  Too many requests
```

---

## FRONTEND ERROR HANDLING RULES

```typescript
// Error boundary in AdRenderer — NEVER shows blank container
if (error.code === 'internal_error') {
  return <HouseAdFallback />
}

// Party reconnect flow — NEVER shows "connection lost" to user
if (error.code === 'party_not_found') {
  router.push('/party')  // redirect to party browser
}

// Campaign errors — show human-readable message
const ERROR_MESSAGES = {
  discount_requires_approval: 'Discounts over 10% need our team to review. We'll reach out shortly.',
  brand_safety_blocked: 'Your creative needs a small adjustment. Check our brand guidelines.',
  slot_not_available: 'That slot was just reserved. Choose another slot or date.',
}
```
