# Subdomain Ownership and Service Map

This document is the canonical source of truth for all production and pre-production domains associated with The Musician's Index platform. Do not alter DNS or service routing without updating this file.

## Production Environment

| Domain | Service / Application | Host | Notes |
| :--- | :--- | :--- | :--- |
| `themusiciansindex.com` | **TMI Frontend** (Next.js) | Vercel (Recommended) | The primary public-facing website. |
| `www.themusiciansindex.com` | **TMI Frontend** (Next.js) | Vercel (Recommended) | Redirects to `themusiciansindex.com`. |
| `api.themusiciansindex.com` | **TMI Backend** (NestJS) | Render | The primary API for the TMI platform. |
| `ai.themusiciansindex.com` | **AI Generator Backend** | Render / Other | The separate service for AI-powered tools. |

## Staging / Development Environment

*To be defined. It is recommended to follow a similar pattern, e.g., `staging.themusiciansindex.com`, `api.staging.themusiciansindex.com`, etc.*
