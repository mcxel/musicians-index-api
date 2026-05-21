# PACK29_PERMISSIONS_MATRIX.md
## Who Can Do What — Complete RBAC Matrix
### BerntoutGlobal XXL / The Musician's Index

Roles: FAN | ARTIST | PRODUCER | ADVERTISER | SPONSOR | EDITOR | ADMIN | OPERATOR | BOT

---

## HOMEPAGE COMPOSITION

| Action | FAN | ARTIST | ADVERTISER | EDITOR | ADMIN | OPERATOR |
|---|---|---|---|---|---|---|
| View homepage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Override belt order | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Toggle belt visibility | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Pin content to slot | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Emergency clear belt | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View belt analytics | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## ADVERTISING

| Action | FAN | ARTIST | ADVERTISER | EDITOR | ADMIN | BOT |
|---|---|---|---|---|---|---|
| Register advertiser account | ✅ | ✅ | n/a | ✅ | ✅ | ❌ |
| Create campaign | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Submit creative | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| View own campaign analytics | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Approve creative | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Reject creative | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View all campaigns | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Set slot pricing | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Override slot reservation | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Emergency pause campaign | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (brand-safety-bot only) |
| Access platform ad analytics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## SPONSOR / DEALS

| Action | ADVERTISER | SPONSOR | EDITOR | ADMIN |
|---|---|---|---|---|
| Submit sponsor inquiry | ❌ | ✅ | ❌ | ✅ |
| View open packages | ✅ | ✅ | ✅ | ✅ |
| Request exclusivity | ❌ | ✅ | ❌ | ✅ |
| Approve exclusivity | ❌ | ❌ | ❌ | ✅ (Big Ace only) |
| Sign contract | ❌ | ✅ | ❌ | ✅ |
| Override sponsor placement | ❌ | ❌ | ❌ | ✅ |
| View all contracts | ❌ | ❌ | ❌ | ✅ |

---

## SALES CRM

| Action | ADMIN | BOT |
|---|---|---|
| Create lead | ✅ | ✅ (prospect-scout.bot) |
| Add sales note | ✅ | ✅ |
| Qualify lead | ✅ | ✅ |
| Generate standard proposal | ✅ | ✅ (proposal.bot) |
| Apply discount ≤ 10% | ✅ | ✅ |
| Apply discount > 10% | ✅ | ❌ (needs human approval) |
| Generate proposal with custom terms | ✅ | ❌ (human required) |
| Approve proposal | ✅ | ❌ |
| Sign exclusivity contract | ✅ (Big Ace only) | ❌ |
| Mark lead LOST | ✅ | ✅ (after inactivity rules) |

---

## PARTY LOBBY

| Action | FAN | ARTIST | ADMIN | HOST |
|---|---|---|---|---|
| Create party | ✅ | ✅ | ✅ | n/a |
| Join public party | ✅ | ✅ | ✅ | n/a |
| Join private party | ✅ (with code) | ✅ (with code) | ✅ | n/a |
| Invite members | n/a | n/a | n/a | ✅ |
| Kick member | n/a | n/a | ✅ | ✅ |
| Promote to co-host | n/a | n/a | n/a | ✅ |
| Disband party | n/a | n/a | ✅ | ✅ |
| Initiate join-together | n/a | n/a | n/a | ✅ (and co-host) |
| Change party scene | n/a | n/a | n/a | ✅ (and co-host) |
| View party (non-member) | ❌ | ❌ | ✅ | n/a |

Note: Kids in child accounts cannot create or join parties with adults.
canJoinParty() check mirrors canSendMessage() — same age-group rules apply.

---

## GAMES

| Action | FAN | ARTIST | ADMIN | GAME HOST |
|---|---|---|---|---|
| Browse game sessions | ✅ | ✅ | ✅ | n/a |
| Join game as player | ✅ | ✅ | ✅ | n/a |
| Watch game as audience | ✅ | ✅ | ✅ | n/a |
| Create game session | ✅ | ✅ | ✅ | n/a |
| Start game (as host) | n/a | n/a | n/a | ✅ |
| Kick player | n/a | n/a | ✅ | ✅ |
| End game early | n/a | n/a | ✅ | ✅ |
| Link game to sponsor | n/a | n/a | ✅ | ❌ |
| View game analytics | n/a | n/a | ✅ | n/a |
| Mark game as ranked | n/a | n/a | ✅ | ❌ |

---

## EDITORIAL

| Action | FAN | ARTIST | EDITOR | ADMIN |
|---|---|---|---|---|
| Read articles | ✅ | ✅ | ✅ | ✅ |
| Create article | ❌ | ✅ (own profile only) | ✅ | ✅ |
| Submit for review | ❌ | ✅ (own) | ✅ | ✅ |
| Review/approve article | ❌ | ❌ | ✅ | ✅ |
| Publish article | ❌ | ❌ | ✅ | ✅ |
| Unpublish article | ❌ | ❌ | ❌ | ✅ |
| Assign article ad slots | ❌ | ❌ | ✅ | ✅ |
| Manage sponsored articles | ❌ | ❌ | ❌ | ✅ |

---

## BOT AUTONOMY SUMMARY

What BOTS can do without human approval:
✅ Prospect discovery and outreach (standard message templates)
✅ Lead qualification (scoring algorithm, no commitments)
✅ Package recommendations (from approved package list)
✅ Standard proposal generation (no discount > 10%, no custom terms)
✅ Follow-up messages (up to 3 per lead, standard cadence)
✅ Tentative slot reservations (24h hold)
✅ Campaign expiration handling
✅ Brand safety auto-pause (flagged categories)
✅ House ad fallback activation
✅ Homepage belt content assembly
✅ Article ad slot filling
✅ Stream & Win point calculation

What ALWAYS requires human (Big Ace) approval:
❌ Discounts > 10%
❌ Custom legal terms
❌ Exclusivity deals
❌ Premium takeover contracts > $500/week
❌ Long-term contracts > 30 days
❌ Sensitive brand categories (case-by-case)
❌ Proposals with custom slot combinations not in standard packages
