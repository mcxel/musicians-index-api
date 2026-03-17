# Email Delivery and Activation

This document defines the configuration and proof checklist for all outbound email functionalities for The Musician's Index.

## Email Service Provider

- **Provider:** AWS Simple Email Service (SES) (Recommended) / SendGrid / Postmark
- **Sender Address:** `noreply@themusiciansindex.com`
- **Region:** `[e.g., us-east-1]`

## DNS / Sender Verification

The following DNS records must be configured to ensure high deliverability and sender reputation.

| Type | Name / Host | Value | Status |
| :--- | :--- | :--- | :--- |
| **SPF** | `themusiciansindex.com` | `v=spf1 include:amazonses.com ~all` (Example) | `[ ] Pending` / `[x] Complete` |
| **DKIM** | `[Selector]._domainkey` | `[Value provided by ESP]` | `[ ] Pending` / `[x] Complete` |
| **DKIM** | `[Selector]._domainkey` | `[Value provided by ESP]` | `[ ] Pending` / `[x] Complete` |
| **DKIM** | `[Selector]._domainkey` | `[Value provided by ESP]` | `[ ] Pending` / `[x] Complete` |
| **DMARC**| `_dmarc.themusiciansindex.com`| `v=DMARC1; p=quarantine;` (Example) | `[ ] Pending` / `[x] complete` |

## Email Templates

The following email templates must be created in the Email Service Provider's system.

- `admin-invite`: Sent to initial admins during bootstrap.
- `user-activation`: Standard "Please verify your email" sent on signup.
- `password-reset`: Sent when a user requests a password reset.
- `onboarding-complete`: A welcome email sent after a user finishes the onboarding flow.

## Proof Checklist

This checklist must be completed to verify the end-to-end email flow.

| # | Action | Expected Result | Status |
|---|---|---|---|
| 1 | Send a test email from the service provider's console. | Email is received in a test inbox (e.g., Gmail, Outlook). | `[ ]` |
| 2 | Create a new user account via the signup page. | An activation email (`user-activation`) is received. | `[ ]` |
| 3 | Click the activation link in the email. | The user account is marked as verified, and the user is logged in or redirected to the login page. The link can only be used once. | `[ ]` |
| 4 | From the login page, trigger the "Forgot Password" flow. | A password reset email (`password-reset`) is received. | `[ ]` |
| 5 | Click the link in the reset email and set a new password. | The password is changed successfully, and the user can log in with the new password. | `[ ]`|
| 6 | Run the admin bootstrap seed script. | An admin invite email (`admin-invite`) is sent to the specified admin emails. | `[ ]` |
| 7 | Complete the member onboarding flow. | A welcome email (`onboarding-complete`) is received. | `[ ]` |
