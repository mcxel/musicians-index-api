# ROUTING CERTIFICATION MATRIX
**Date:** 2026-06-16 | **Phase:** 1 (Routing Certification)

**The Golden Standard:** Every click must result in a valid route, load data, load media, and avoid dead ends, placeholders, or blank states. Every user flow must be complete before any new features are wired.

## 1. Home Network
| Surface | Status | Dead Links / Blockers | Next Action |
| :--- | :--- | :--- | :--- |
| **Home 1 (Cover)** | 🟡 PARTIAL | Missing DiscoveryRail | Add canonical rail |
| **Home 1-2 (Billboard)** | 🔴 FAIL | Video missing, Ads missing | Restore MotionPosterPlayer |
| **Home 2 (Magazine)** | 🔲 PENDING | | |
| **Home 3 (Live World)** | 🟡 PARTIAL | Missing DiscoveryRail | Add canonical rail |
| **Home 4 (Marketplace)** | 🔲 PENDING | | |
| **Home 5 (Arena)** | 🔴 FAIL | Hardcoded active users | Wire to LiveRegistry |

## 2. Live Network
| Surface | Status | Dead Links / Blockers | Next Action |
| :--- | :--- | :--- | :--- |
| **Live Room** | 🔲 PENDING | | |
| **Battle** | 🔲 PENDING | | |
| **Cypher** | 🔲 PENDING | | |
| **Challenge** | 🔲 PENDING | | |
| **Dance Party** | 🔲 PENDING | | |
| **Fan Lobby** | 🔲 PENDING | | |

## 3. Profile Network
| Surface | Status | Dead Links / Blockers | Next Action |
| :--- | :--- | :--- | :--- |
| **Performer** | 🔲 PENDING | | |
| **Fan** | 🔲 PENDING | | |
| **Sponsor** | 🔲 PENDING | | |
| **Venue** | 🔲 PENDING | | |
| **Producer** | 🔲 PENDING | | |

## 4. Commerce Network
| Surface | Status | Dead Links / Blockers | Next Action |
| :--- | :--- | :--- | :--- |
| **Membership** | 🔲 PENDING | | |
| **Ticket** | 🔲 PENDING | | |
| **Tip** | 🔲 PENDING | | |
| **Booking** | 🔲 PENDING | | |
| **Sponsor** | 🔲 PENDING | | |
| **Advertiser** | 🔲 PENDING | | |
| **Marketplace** | 🔲 PENDING | | |

## 5. Auth / Onboarding Network (Wave A)
| Surface | Status | Dead Links / Blockers | Next Action |
| :--- | :--- | :--- | :--- |
| **Google Signup** | 🔴 BLOCKED | Routes to wrong/legacy dashboard | Fix OAuth callback |
| **Email Signup** | 🔲 PENDING | | Verify role assignment |
| **Role Selection** | 🔲 PENDING | | Verify DB update |
| **Fan Onboarding** | 🔲 PENDING | | |
| **Performer Onboarding**| 🔲 PENDING | | |
| **Producer Onboarding** | 🔲 PENDING | | |
| **Writer Onboarding** | 🔲 PENDING | | |
| **Venue Onboarding** | 🔲 PENDING | | |

## 6. Dashboard Certification (Wave B)
| Dashboard | Status | Expected Route | Next Action |
| :--- | :--- | :--- | :--- |
| **Fan Hub (Claude)** | 🔴 BLOCKED | `/hub/fan` | Remove legacy route mappings |
| **Performer Hub (Claude)**| 🔲 PENDING | `/hub/performer` | |
| **Producer HQ** | 🔲 PENDING | `/hub/producer` | |
| **Writer Hub** | 🔲 PENDING | `/hub/writer` | |
| **Venue Hub** | 🔲 PENDING | `/hub/venue` | |
| **Sponsor Hub** | 🔲 PENDING | `/hub/sponsor` | |
| **Admin Hub** | 🔲 PENDING | `/admin/hub` | |
| **Overseer Deck** | 🔲 PENDING | `/admin/overseer` | |