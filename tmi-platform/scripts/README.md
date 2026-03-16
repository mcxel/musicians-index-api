# TMI Platform Scripts

This directory contains various scripts for automating tasks, running quality checks, and managing the application.

## 🚀 Application Management

### `promote-admin.ts`

This script promotes a regular user to an ADMIN role in the database. This is necessary to bootstrap the first administrator for the application.

**Usage:**

1.  Ensure the application is running or the database is accessible.
2.  Run the script from the `tmi-platform` directory, passing the user's email as an argument.

```bash
# Make sure you have set up your .env file with the DATABASE_URL
pnpm ts-node scripts/promote-admin.ts "user@example.com"
```

---

## 📦 Installer Helper Scripts

These scripts are used by the Inno Setup installer (`/install/installer.iss`) and are not intended to be run directly by most users.

-   **`start-server.bat`**: Starts the Python backend and the Next.js web server. This is the main executable for the installed application.
-   **`start-kiosk.bat`**: Launches the application in a browser's kiosk mode, pointing to the HUD display. It depends on the servers started by `start-server.bat`.
-   **`pre-install-check.ps1`**: A prerequisite check script run by the installer to verify dependencies like Python are installed on the user's system.

---

## ✅ Quality Assurance

These scripts are used to ensure the code is high-quality and ready for deployment.

-   **`test-all.ps1`**: The main entry point for build and test execution. It first attempts a production build of the web app and, if successful, proceeds to run the gate scripts.
-   **`gates.ps1`**: A series of "gates" that the code must pass. This includes:
    -   TypeScript type checking
    -   ESLint linting
    -   A final production build
    -   Smoke tests for critical API endpoints (`/healthz`, `/readyz`, `/api/internal/runtime/status`)

**Usage:**

Run `test-all.ps1` from the root of the repository.

```powershell
./tmi-platform/scripts/test-all.ps1
```
