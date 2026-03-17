# Engine: Platform Kernel

**Purpose:** The root engine for authentication, authorization, and session management. It is the first engine to load and the authority on user identity.

## Responsibilities
- Manages user identity, roles, and permissions.
- Handles session creation, validation, and destruction.
- Owns the Access Control List (ACL) for all modules and routes.

## Inputs
- User credentials (login).
- Session tokens (subsequent requests).

## Outputs
- Authenticated user session object.
- Access control decisions (allow/deny).

## Connected Modules
- All modules requiring authentication (Artist Dashboard, Store, Admin Panels).

## Connected Engines
- `StateEngine` (to store session state).
- `EventBus` (to publish auth events like `USER_LOGIN`).

## Not Responsible For
- The business logic of any other module.
- Storing application state beyond the current session.