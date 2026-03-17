# Deployment Plan: TMI Frontend on `themusiciansindex.com`

This document provides the exact steps to deploy The Musician's Index frontend and make it live at `themusiciansindex.com`.

**Hosting Recommendation:** **Vercel** is the strongly recommended host for the Next.js frontend. It is built by the creators of Next.js and has first-class, zero-configuration support for `pnpm` monorepos, which will make deployment significantly faster and more reliable than other generic Node.js hosts.

---

## Step 1: Deploy to Vercel

1.  **Sign up or log in to Vercel** using your GitHub account.
2.  From the dashboard, click **"Add New... -> Project"**.
3.  **Import the Git Repository** that contains your `tmi-platform` project. You will need to grant Vercel access to the repository.
4.  Vercel will automatically detect that it is a `pnpm` monorepo. It will show you the applications within your workspace.
5.  Locate the frontend application (likely named `web` or `tmi-platform-web`) and select it.
6.  Vercel will pre-fill the **Build and Output Settings**. They should be correct by default:
    - **Framework Preset:** `Next.js`
    - **Build Command:** `pnpm build` (or similar)
    - **Output Directory:** `.next`
    - **Root Directory:** `tmi-platform/apps/web`
    Vercel is smart about monorepos; trust its defaults here. If you need to set the root directory, ensure it points to the Next.js app's folder (`tmi-platform/apps/web`).

## Step 2: Configure Environment Variables

Before deploying, you must set the environment variables the frontend needs to run.

1.  In the Vercel project configuration screen, open the **Environment Variables** section.
2.  Add the following variables.

    | Variable Name | Value | Notes |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_API_URL` | `https://api.themusiciansindex.com` | **CRITICAL.** Points to the live TMI backend. |
    | `NEXT_PUBLIC_WS_URL` | `wss://api.themusiciansindex.com` | **CRITICAL.** The WebSocket URL for the live backend. |
    | `NEXTAUTH_SECRET` | `[Generate a new secret]`| **CRITICAL.** Run `openssl rand -hex 32` in your terminal to create one. |
    | `NEXTAUTH_URL` | `https://themusiciansindex.com` | Set this to your final production domain. |
    | `ROUTING_STATE_SECRET`| `[Generate a new secret]`| Can be the same value as `NEXTAUTH_SECRET`. |
    | `STRIPE_SECRET_KEY`| `sk_test_...` | Your Stripe *test* mode secret key. |
    | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your Stripe *test* mode publishable key. |
    | `EMAIL_SERVER_HOST` | `[From your email provider]` | e.g., `email-smtp.us-east-1.amazonaws.com` |
    | `EMAIL_SERVER_USER` | `[From your email provider]` | SMTP username. |
    | `EMAIL_SERVER_PASSWORD`| `[From your email provider]`| SMTP password. |
    | `EMAIL_FROM` | `noreply@themusiciansindex.com` | |

    **IMPORTANT:** The `DATABASE_URL` found in the `.env.example` should **NOT** be included here. The frontend should not have direct database access.

## Step 3: Deploy and Verify

1.  Click the **"Deploy"** button on Vercel.
2.  The deployment will start. You can watch the build logs in real-time. Vercel will run `pnpm install`, then build the Next.js application.
3.  Once complete, Vercel will assign you a temporary URL (e.g., `tmi-web-a1b2c3d.vercel.app`).
4.  **Visit this temporary URL.** The TMI homepage should load. Check the browser's developer console for any errors. This proves the build is working.

## Step 4: Connect the Production Domain

1.  In your new Vercel project, go to the **"Domains"** tab.
2.  Enter `themusiciansindex.com` and click **"Add"**.
3.  Vercel will recommend adding `www.themusiciansindex.com` as well and setting up a redirect. This is best practice.
4.  Vercel will then provide you with the **DNS records** you need to add at your domain registrar (or Cloudflare). It will be either a set of Nameservers or an `A` / `CNAME` record.
5.  Go to your **Cloudflare** DNS settings for `themusiciansindex.com`.
6.  Update your `A` record for the root (`@`) and your `CNAME` for `www` to point to the values provided by Vercel.
7.  Wait for DNS propagation (usually fast with Cloudflare). Vercel will automatically provision an SSL certificate.

## Step 5: Final Verification

- Navigate to `https://themusiciansindex.com`.
- The TMI homepage should load securely over HTTPS.
- The proof checklist in `LAUNCH_PROOF_LADDER.md` can now begin.
