# AVATAR UNIFICATION REPORT
**Date:** 2026-06-15 | **Phase 3**

**Goal:** One identity source for images across the entire ecosystem.

| Surface | Uses Unified `User.image` / `Profile.avatarUrl`? | Status / Notes |
| :--- | :--- | :--- |
| **Upload Pipeline** | 🔴 **FAIL** | User-facing upload/crop UI does not exist. |
| **Cloud Storage** | 🔴 **FAIL** | S3 / Vercel Blob integration for user uploads is missing. |
| **Profile Page** | 🟡 **WARNING** | Uses `User.image` from session, but no way to update it. |
| **Homepage 1 (Cover)** | 🔴 **FAIL** | Currently uses hardcoded `https://i.pravatar.cc/` links. |
| **Billboard Wall** | 🟡 **WARNING** | Unified in code, but relies on mock data arrays. |
| **Live Room** | 🔴 **FAIL** | `MaskedVideoTile` relies on `avatarEmoji` prop instead of real profile avatars. |
| **Battle Arena** | 🔴 **FAIL** | Falls back to generic placeholder shapes/emojis. |
| **Magazine** | 🔴 **FAIL** | Statically defined images in `NewsArticleModel.ts`. |
| **Messaging** | 🟡 **WARNING** | Built into `OmniPresenceEngine`, but using mock data. |

### Summary
The architecture expects a unified `avatarUrl`, but because the **Upload Pipeline** was never built, frontend components rely on Pravatar links, emoji fallbacks, and static mock arrays. 
*Resolution:* Build `/api/profile/upload-avatar` and wire all components to `user.image`.