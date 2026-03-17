# Onboarding Proof Ladder

This document defines the Definition of Done for the member onboarding flow. The flow is not considered complete until all steps in this ladder have been successfully verified in the production environment.

## User Roles
- **Fan:** A general user of the platform.
- **Artist:** A musician or band with a public profile.

## Core Requirements
- **Originality Sticky Note:** A mandatory acknowledgment of content originality must be presented and accepted by the user during the flow. This is a critical legal and platform requirement.

## Onboarding Verification Steps

| # | Step | User Role | Verification Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Sign Up** | Fan, Artist | From the homepage, click "Sign Up" and complete the initial registration form (email, password). | Account is created, user is logged in, and is immediately redirected to the start of the onboarding flow. An activation email is sent. | `[ ]` |
| 2 | **Role Selection** | Fan, Artist | The first step of onboarding presents a choice between "Fan" and "Artist". Select the appropriate role. | The choice is saved, and the user is directed to the next relevant step. | `[ ]` |
| 3 | **Originality Agreement** | Artist | An "Originality Sticky Note" or modal is displayed, requiring the user to agree to terms regarding content ownership. | The user must check a box or click "I Agree" to proceed. The agreement is recorded. The user cannot continue without agreeing. | `[ ]` |
| 4 | **Profile Creation**| Fan, Artist | The user is prompted to fill out basic profile information (e.g., username, display name, avatar). | The user can fill in the fields and upload an avatar. The form saves correctly. | `[ ]` |
| 5 | **Profile Persistence**| Fan, Artist | After submitting the profile information, manually reload the page or navigate away and back. | The previously entered information is still present. The data has been successfully saved to the database. | `[ ]` |
| 6 | **Flow Completion** | Fan, Artist | The user completes the final step of the onboarding flow. | A confirmation message is displayed, and the user is automatically redirected to their main dashboard (`/dashboard`). A welcome email is sent. | `[ ]` |
| 7 | **Dashboard View** | Fan, Artist | The user lands on their dashboard. | The dashboard is displayed correctly, personalized with the user's name/avatar. There are no errors. | `[ ]` |
| 8 | **Post-Onboarding Lockout**| Fan, Artist | After being redirected to the dashboard, attempt to navigate directly to the `/onboarding` URL. | The user is redirected away from the onboarding flow back to their dashboard or the homepage. | `[ ]` |
