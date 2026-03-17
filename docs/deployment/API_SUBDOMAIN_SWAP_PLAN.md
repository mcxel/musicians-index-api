# Deployment Plan: Reclaiming `api.themusiciansindex.com`

This document provides the exact steps to make `api.themusiciansindex.com` serve the correct TMI (The Musician's Index) backend.

**Current State:** `api.themusiciansindex.com` is incorrectly serving a different application (the "BerntoutStudio AI API").
**Target State:** `api.themusiciansindex.com` must serve the TMI backend deployed from the `tmi-platform` NestJS application.

This change requires a simple but critical update in your DNS provider (Cloudflare).

---

## Step 1: Identify the Correct TMI Backend Hostname

First, you must get the official hostname for your deployed TMI backend service from your hosting provider (Render).

1.  **Log in to your Render account.**
2.  Navigate to the Dashboard.
3.  Find the service that is deploying **The Musician's Index backend** (the NestJS application). It might be named something like `tmi-platform-api` or `musicians-index-api-2`.
4.  In the service's header, find its unique `.onrender.com` URL. It will look like this:
    `tmi-backend-service.onrender.com`
5.  **Copy this hostname. This is your Target Hostname.**

## Step 2: Update the DNS Record in Cloudflare

Next, you will update the DNS `CNAME` record to point the public subdomain to the correct Render service.

1.  **Log in to your Cloudflare account.**
2.  Select the `themusiciansindex.com` domain.
3.  Navigate to the **DNS** section in the left sidebar.
4.  In the DNS records list, find the `CNAME` record where the **Name** is `api`.
5.  Click the **Edit** button for that record.
6.  You will see the following fields:
    - **Type:** `CNAME`
    - **Name:** `api`
    - **Content:** `[This will have the old/wrong .onrender.com hostname]`
    - **Proxy status:** `Proxied` (Orange Cloud)
7.  In the **Content** field, **delete the old value** and **paste your new Target Hostname** from Step 1.
8.  Click **Save**.

## Step 3: Verification

Cloudflare updates are nearly instantaneous. You can verify the change immediately.

1.  Wait about one minute.
2.  Open a new browser tab and navigate to `https://api.themusiciansindex.com/`.
3.  **Expected Result:** You should see the response from your TMI backend: `{"ok":true,"service":"tmi-platform-api"}`. You should **not** see the old AI generator API. If you see a `502 Bad Gateway`, this is also acceptable for now, as it indicates you are hitting the TMI backend which may still be having the database issue we previously discussed.
4.  Navigate to `https://api.themusiciansindex.com/api/healthz`.
5.  **Expected Result:** You should see `{"ok":true,...}` or a 502 error from the TMI backend.

---

Once this is complete, the `api.themusiciansindex.com` subdomain will be correctly pointing to the TMI backend, resolving the backend identity mismatch. This is the single most important step to unblock the rest of the launch.
