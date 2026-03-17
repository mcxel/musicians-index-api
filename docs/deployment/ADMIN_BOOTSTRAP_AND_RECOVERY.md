# Admin Bootstrap and Recovery

This document outlines the procedure for creating the initial administrator accounts for The Musician's Index and the recovery process in case of lockout.

## Initial Admin Accounts

The following two accounts must be created as the first users of the platform with full administrative privileges.

| User | Email | Role |
| :--- | :--- | :--- |
| Marcel | `[REPLACE_WITH_MARCEL_EMAIL]` | `SUPER_ADMIN` |
| J. Paul Sanchez | `[REPLACE_WITH_JPAUL_EMAIL]` | `SUPER_ADMIN` |

## Bootstrap Method

The creation of the first admin accounts will be handled by a secure, one-time-use database seed script.

**Execution:**
1.  Connect to the production database via a secure shell or a local client with SSH tunneling.
2.  Run the `seed:admin` script defined in `tmi-platform/package.json`.
3.  The script will:
    *   Create two user records with the emails defined above.
    *   Assign the `SUPER_ADMIN` role.
    *   Generate a secure, single-use password reset link for each user.
    *   Send an "Admin Account Created" email containing this link to each user.
4.  The admin will use the link to set their initial password. The link will expire after first use or 24 hours.
5.  After both admins have successfully logged in, the seed script functionality should be disabled or removed from production builds for security.

## Lockout Recovery Plan

If one administrator is locked out, the other administrator can use the admin dashboard to:
- Reset the locked-out user's password.
- Send a new password reset email.

If **both** administrators are locked out, recovery requires manual intervention by a developer with database access.

**Dual Admin Lockout Recovery:**
1.  A developer with production database access will connect securely.
2.  The developer will manually generate a new password reset token for one of the admins.
3.  The token will be securely communicated to the admin.
4.  The admin will use the token to regain access and can then assist the other admin.
