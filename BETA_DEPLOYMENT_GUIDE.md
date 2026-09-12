# BayanihanHub — Full Beta Testing Deployment Guide

**Date:** September 12, 2026
**Version:** Beta v1.0.0
**Status:** Ready for Beta Deployment
**Branch:** `main` | **Commit:** `9857e4e`
**Repository:** https://github.com/Jehooooo/BayanihanHub

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Pre-Deployment Checklist](#3-pre-deployment-checklist)
4. [Local Development Setup](#4-local-development-setup)
5. [Database Setup (Laragon + MySQL)](#5-database-setup-laragon--mysql)
6. [Backend Startup (FastAPI)](#6-backend-startup-fastapi)
7. [Frontend Startup (Vite + React)](#7-frontend-startup-vite--react)
8. [Seed / Default Accounts](#8-seed--default-accounts)
9. [Application Features & Pages](#9-application-features--pages)
10. [API Endpoints Reference](#10-api-endpoints-reference)
11. [Beta Testing Protocol](#11-beta-testing-protocol)
12. [Bug Reporting Instructions](#12-bug-reporting-instructions)
13. [Known Beta Limitations](#13-known-beta-limitations)
14. [Environment Variables Reference](#14-environment-variables-reference)
15. [Git Workflow During Beta](#15-git-workflow-during-beta)

---

## 1. System Overview

**BayanihanHub** is a full-stack community exchange and donation platform built for barangay-level use in the Philippines. It enables neighbors to donate unused items, fulfill urgent community needs, and safely barter goods with verified members.

### Architecture

```
┌─────────────────────────────────┐
│     Frontend (React + Vite)     │  Port 5173  (dev)
│     TypeScript · TailwindCSS v4 │
└──────────────┬──────────────────┘
               │ REST API calls (http://localhost:3001/api/*)
┌──────────────▼──────────────────┐
│   Backend (Python + FastAPI)    │  Port 3001
│   SQLAlchemy · Uvicorn          │
└──────────────┬──────────────────┘
               │ MySQL connection
┌──────────────▼──────────────────┐
│  Database (MySQL 8.4 · Laragon) │  Port 3307
│  44 tables · 3NF · bayanihan_hub│
└─────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.x |
| Styling | TailwindCSS | 4.x |
| Routing | React Router DOM | 7.x |
| State Management | Zustand | 5.x |
| HTTP Client | Fetch API (custom service layer) | — |
| UI Icons | Lucide React | 1.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Toast Notifications | React Hot Toast | 2.x |
| Data Visualization | Recharts | 3.x |
| Maps | Leaflet / MapLibre GL | 1.x / 6.x |

### Backend
| Layer | Technology | Version |
|-------|-----------|---------|
| API Framework | FastAPI | ≥0.115.0 |
| Server | Uvicorn (ASGI) | ≥0.32.0 |
| ORM | SQLAlchemy | ≥2.0.0 |
| Database Driver | PyMySQL | ≥1.1.0 |
| Data Validation | Pydantic | ≥2.10.0 |
| File Uploads | python-multipart | ≥0.0.19 |
| Environment | python-dotenv | ≥1.0.1 |

### Database
| Item | Value |
|------|-------|
| Engine | MySQL 8.4.3 Community Server |
| Host | MySQL via Laragon |
| Port | 3307 |
| Database | `bayanihan_hub` |
| Tables | 44 normalized tables (3NF) |
| Schema | `backend/db/schema.sql` |

---

## 3. Pre-Deployment Checklist

Complete every item before starting beta testing tomorrow.

### Hardware & Software Requirements
- [ ] Windows PC with **Laragon** installed (provides MySQL 8.4 on port 3307)
- [ ] **Node.js** v18+ installed (`node -v` to confirm)
- [ ] **Python 3.11+** installed (`python --version` to confirm)
- [ ] **Git** installed (`git --version` to confirm)
- [ ] Browser: Chrome or Edge (latest version recommended)
- [ ] Stable internet connection (for Google Maps API and GitHub)

### Repository & Code
- [ ] Pull the latest code from `main`
  ```powershell
  git pull origin main
  ```
- [ ] Verify you are on commit `9857e4e` or later
  ```powershell
  git log -n 1 --oneline
  ```

### Database
- [ ] **Laragon is running** (Green status in Laragon control panel)
- [ ] MySQL is accessible on `localhost:3307`
- [ ] Database `bayanihan_hub` exists and has 44 tables
- [ ] Admin and Jehosue seed accounts exist (see Section 8)

### Backend
- [ ] Python virtual environment (`.venv`) exists and is activated
- [ ] All Python packages installed (`requirements.txt`)
- [ ] `backend/.env` file exists with correct MySQL credentials
- [ ] Backend starts without errors on port 3001
- [ ] Health check passes: `http://localhost:3001/health` returns `{"status": "online"}`
- [ ] DB health passes: `http://localhost:3001/api/db-health` returns `{"status": "connected"}`

### Frontend
- [ ] `node_modules` installed (`npm install`)
- [ ] Vite dev server starts on port 5173 (`npm run dev`)
- [ ] No TypeScript compilation errors (`npm run build` exits with code 0)
- [ ] Beta Notice modal appears on Landing (`/`), Login (`/login`), and Home (`/dashboard`)

---

## 4. Local Development Setup

### Step 1 — Clone or Pull Repository

```powershell
# If first time:
git clone https://github.com/Jehooooo/BayanihanHub.git BayanihanHubAfter
cd BayanihanHubAfter

# If already cloned:
cd BayanihanHubAfter
git pull origin main
```

### Step 2 — Install Frontend Dependencies

```powershell
npm install
```

### Step 3 — Setup Python Virtual Environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 4 — Configure Backend Environment

The `backend/.env` file should contain:

```env
PORT=3001
HOST=0.0.0.0
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=bayanihan_hub
DATABASE_URL=mysql+pymysql://root:@localhost:3307/bayanihan_hub?charset=utf8mb4
CORS_ORIGINS=*
VERIFICATION_PROVIDER=biometric
VERIFICATION_API_KEY=
```

> [!NOTE]
> Laragon MySQL uses **port 3307** (not the default 3306) to avoid conflict with other MySQL installations on the machine.

### Step 5 — Start Both Servers Together (Recommended)

```powershell
npm run dev:all
```

This runs both the backend (blue) and frontend (green) concurrently with labeled output.

**Or start them separately:**

```powershell
# Terminal 1 — Backend
cd backend
..\.venv\Scripts\python.exe run.py

# Terminal 2 — Frontend
npm run dev
```

### Step 6 — Verify Everything is Running

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Frontend | http://localhost:5173 | BayanihanHub landing page |
| Backend Health | http://localhost:3001/health | `{"status": "online"}` |
| DB Health | http://localhost:3001/api/db-health | `{"status": "connected"}` |
| API Docs | http://localhost:3001/docs | Interactive Swagger UI |

---

## 5. Database Setup (Laragon + MySQL)

### Starting Laragon

1. Open **Laragon** application
2. Click **Start All** (or start MySQL individually)
3. Confirm MySQL is **green/running** on port **3307**

### Initializing the Database (First Time Only)

If the `bayanihan_hub` database is empty or missing tables:

```powershell
cd backend
.\.venv\Scripts\python.exe db\init_db.py
```

This will:
- Create all 44 normalized MySQL tables
- Set up foreign key constraints and indexes
- Insert reference data (16 Philippine Government ID types, item categories, roles, account statuses)

### Seeding User Accounts

```powershell
cd backend
.\.venv\Scripts\python.exe db\seed_users.py
```

### Seeding Community Items

```powershell
cd backend
.\.venv\Scripts\python.exe db\seed_items.py
```

### Verifying the Database (HeidiSQL / Laragon)

1. Click **Database** in Laragon → opens HeidiSQL
2. Connect with: host `127.0.0.1`, user `root`, password *(blank)*, port `3307`
3. Select database `bayanihan_hub`
4. Confirm you see tables like: `users`, `profiles`, `items`, `item_images`, `conversations`, `messages`, `exchanges`, `community_requests`, `notifications`, etc.

---

## 6. Backend Startup (FastAPI)

### Standard Start

```powershell
cd backend
.\.venv\Scripts\python.exe run.py
```

Expected startup output:
```
Starting Bayanihan Hub Python FastAPI Backend on http://0.0.0.0:3001
Interactive Swagger Documentation: http://localhost:3001/docs
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:3001 (Press CTRL+C to quit)
```

### Loaded API Routers (12 Total)

| Router | Prefix | Purpose |
|--------|--------|---------|
| `auth` | `/api/auth` | Registration, login, JWT auth |
| `verification` | `/api/verification` | ID document & facial biometric |
| `admin` | `/api/admin` | Admin-only management endpoints |
| `reports` | `/api/reports` | Community moderation reports |
| `notifications` | `/api/notifications` | User notification system |
| `items` | `/api/items` | Item listings, images, saving |
| `exchanges` | `/api/exchanges` | Barter exchange proposals |
| `requests` | `/api/requests` | Community item requests |
| `messaging` | `/api/messaging` | Direct messaging & conversations |
| `profile` | `/api/profile` | User profile & settings |
| `ai` | `/api/ai` | AI chatbot assistant |
| `terminal` | `/api/terminal` | Admin live log terminal (SSE) |

### Static Files

Uploaded item images are served from:
```
http://localhost:3001/uploads/items/
```

---

## 7. Frontend Startup (Vite + React)

### Development Mode

```powershell
npm run dev
```

Vite starts at **http://localhost:5173** with hot module replacement.

### Production Build (Verification)

```powershell
npm run build
```

Expected output:
```
✓ 1901 modules transformed.
dist/index.html                           1.00 kB
dist/assets/index-*.css                145.63 kB
dist/assets/index-*.js               1,761.75 kB
✓ built in ~1.6s
```

> [!IMPORTANT]
> The build must exit with **code 0** and **0 TypeScript errors** before every beta session. Run `npm run build` to verify.

### Environment Note

The frontend uses a hardcoded API base URL pointing to `http://localhost:3001`. If testing on a different machine, update `src/services/` base URL accordingly.

---

## 8. Seed / Default Accounts

These are the **only pre-seeded accounts** in the beta database. All other users must register through the application.

### Admin Account

| Field | Value |
|-------|-------|
| **Role** | Administrator |
| **Email** | *(check `backend/db/seed_users.py` for exact value)* |
| **Access** | `/admin` dashboard — full moderation & system management |
| **Status** | APPROVED |

### Jehosue Account (Primary Test User)

| Field | Value |
|-------|-------|
| **Name** | Jehosue Biscarra |
| **Email** | `jehosuebiscarra@gmail.com` |
| **Password** | `password123` |
| **Role** | User |
| **Status** | APPROVED |
| **Access** | Full user dashboard at `/dashboard` |

> [!CAUTION]
> Do NOT share these credentials publicly. These accounts contain seeded community items and test data specific to this beta deployment.

---

## 9. Application Features & Pages

### Public Pages (No Login Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Hero, features overview, how it works |
| `/login` | Login Page | Email + password login |
| `/register` | Register Page | New user registration with ID verification |
| `/forgot-password` | Forgot Password | Password reset flow |

### Authenticated User Pages

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Home / Dashboard | Feed of recent items, active requests, welcome |
| `/browse` | Browse Items | Filter & search all available donations/exchanges |
| `/items/:id` | Item Details | Full item view, photos, request/offer buttons |
| `/post-item` | Post Item | Multi-step form to list a new donation or exchange |
| `/request-item` | Request Item | Submit an urgent community need |
| `/requests` | Community Requests | View and fulfill active community requests |
| `/exchange` | My Exchanges | Track outgoing & incoming barter proposals |
| `/saved` | Saved Items | Bookmarked items |
| `/messages` | Direct Messaging | One-on-one conversations with neighbors |
| `/notifications` | Notifications | Activity alerts and updates |
| `/profile` | My Profile | Personal listings, ratings, and settings |
| `/settings` | Settings | Notifications, privacy, appearance, security |
| `/rate/:id` | Rating Page | Leave a rating after a completed exchange |

### Admin Pages

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Dashboard | System stats, report alerts, moderation queue |
| `/admin/users` | Manage Users | View, suspend, approve, reject user accounts |
| `/admin/posts` | Manage Posts | Moderate item listings |
| `/admin/requests` | Manage Requests | Oversee community requests |
| `/admin/reports` | Manage Reports | Review and resolve content reports |
| `/admin/categories` | Manage Categories | Item category administration |
| `/admin/approvals` | Pending Approvals | Review identity verification submissions |
| `/admin/terminal` | Live Terminal | Real-time API request logs (SSE) |

---

## 10. API Endpoints Reference

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login with email + password
GET    /api/auth/me                Get current authenticated user
PATCH  /api/auth/change-password   Update password
```

### Items
```
GET    /api/items                  List all items (supports filters)
POST   /api/items                  Create new item listing
GET    /api/items/:id              Get item details
PATCH  /api/items/:id              Update item
DELETE /api/items/:id              Remove item
POST   /api/items/upload-image     Upload item image (multipart)
POST   /api/items/:id/save         Save/bookmark item
DELETE /api/items/:id/save         Unsave item
```

### Messaging
```
GET    /api/messaging/conversations           List conversations
POST   /api/messaging/conversations           Create conversation
GET    /api/messaging/conversations/:id/messages  Get messages
POST   /api/messaging/conversations/:id/messages  Send message
```

### Exchanges
```
GET    /api/exchanges              List my exchanges
POST   /api/exchanges              Propose a barter exchange
PATCH  /api/exchanges/:id/accept   Accept exchange offer
PATCH  /api/exchanges/:id/reject   Reject exchange offer
PATCH  /api/exchanges/:id/complete Mark exchange complete
```

### Requests
```
GET    /api/requests               List community requests
POST   /api/requests               Submit a new request
PATCH  /api/requests/:id/fulfill   Fulfill a request
```

### Notifications
```
GET    /api/notifications          Get user notifications
PATCH  /api/notifications/:id/read Mark notification as read
PATCH  /api/notifications/read-all Mark all as read
```

### Health
```
GET    /health                     Backend health check
GET    /api/db-health              Database connection check
GET    /docs                       Swagger interactive API docs
```

---

## 11. Beta Testing Protocol

### Before Each Testing Session

1. **Start Laragon** → confirm MySQL is running (green)
2. **Start backend** → confirm `http://localhost:3001/health` returns online
3. **Start frontend** → confirm `http://localhost:5173` loads
4. **Verify Beta Notice** → the modal must appear on Landing, Login, and Home on every load
5. **Login** with Jehosue account to begin user testing
6. **Login** with Admin account separately to test admin features

### Test Scenarios for Beta Day

#### Scenario A — User Registration Flow
- [ ] Visit `/register`
- [ ] Complete registration form with valid Philippine details
- [ ] Upload a valid government-issued ID
- [ ] Complete facial verification step
- [ ] Confirm account status is `PENDING` after registration
- [ ] Login as admin and approve the new user from `/admin/approvals`
- [ ] Confirm the user can now log in successfully

#### Scenario B — Item Donation Flow
- [ ] Login as Jehosue
- [ ] Go to `/post-item`
- [ ] Fill in item details (title, category, condition, description, location)
- [ ] Upload at least 2 photos
- [ ] Submit and confirm item appears on `/browse`
- [ ] Click the item and verify all details on `/items/:id`

#### Scenario C — Barter/Exchange Flow
- [ ] Browse available items on `/browse`
- [ ] Click an item listed as "For Exchange"
- [ ] Click "Propose Exchange" and fill in the offer
- [ ] Confirm exchange appears in `/exchange` with status `PENDING`
- [ ] Login as the item owner and accept/reject the offer
- [ ] Confirm status updates correctly

#### Scenario D — Community Request Flow
- [ ] Go to `/request-item` and submit a request (e.g., "Need 3 school notebooks")
- [ ] Confirm the request appears on `/requests`
- [ ] As another user, click "Fulfill This Request"
- [ ] Confirm both users receive notifications

#### Scenario E — Messaging Flow
- [ ] Click "Message" on any item detail page
- [ ] Send a message to the item owner
- [ ] Go to `/messages` and confirm the conversation appears
- [ ] Reply as the recipient
- [ ] Verify message delivery without page refresh

#### Scenario F — Admin Moderation
- [ ] Login as Admin
- [ ] Check `/admin` for system stats (users, posts, active requests)
- [ ] Go to `/admin/reports` and review any flagged content
- [ ] Go to `/admin/approvals` to approve or reject pending identity verifications
- [ ] Go to `/admin/terminal` and watch live API logs

#### Scenario G — Beta Notice Behavior (MANDATORY)
- [ ] Visit `/` (Landing Page) — beta modal must appear
- [ ] Click Okay, modal closes
- [ ] Refresh page — modal must reappear
- [ ] Visit `/login` — beta modal must appear
- [ ] Refresh — modal must reappear
- [ ] Login successfully, reach `/dashboard` — beta modal must appear
- [ ] Refresh dashboard — modal must reappear
- [ ] Confirm **NO emojis** in the modal (SVG icons only)
- [ ] Confirm email `jbiscarra24113423@student.dmmmsu.edu.ph` is correct and clickable

#### Scenario H — Mobile Responsiveness
- [ ] Open Chrome DevTools → Toggle device toolbar (F12 → Ctrl+Shift+M)
- [ ] Set viewport to **375×812** (iPhone SE / iPhone 14)
- [ ] Browse Landing, Login, Dashboard, Browse, Item Details, Messaging
- [ ] Confirm no horizontal scrollbar appears anywhere
- [ ] Confirm all buttons, cards, and modals are fully usable at 375px
- [ ] Test Beta Notice modal at 320px width (smallest supported)

---

## 12. Bug Reporting Instructions

When you encounter a bug or unexpected behavior during beta testing, report it immediately to the development team.

### Who to Contact

Report to any member of the development team:

- **Jehosue** (Lead Developer)
- **Christopher**
- **Laurice**
- **Trisha**
- **Leah**

**Team Email:** jbiscarra24113423@student.dmmmsu.edu.ph

### What to Include in Your Report

For each bug found, include as much of the following as possible:

| Item | Details to Provide |
|------|-------------------|
| **Summary** | One sentence describing what went wrong |
| **Page / Route** | Which page URL were you on (e.g., `/browse`, `/messages`) |
| **Steps to Reproduce** | Numbered list of exactly what you did before the bug appeared |
| **Expected Behavior** | What you expected to happen |
| **Actual Behavior** | What actually happened |
| **Screenshot / Photo** | A screenshot or phone photo of the error or broken state |
| **Video Recording** | Screen recording of the full sequence of events (highly helpful) |
| **Browser & OS** | e.g., Chrome 128, Windows 11 / iOS 17 / Android 14 |
| **Account Used** | Which account were you logged in as? |
| **Error Messages** | Any text shown in red, pop-up toasts, or browser console errors |

### Bug Severity Levels

| Level | Label | Examples |
|-------|-------|---------|
| P1 | **Critical** | Cannot login, data lost, app crashes on load |
| P2 | **High** | Feature completely broken, data not saving |
| P3 | **Medium** | Feature partially broken, workaround exists |
| P4 | **Low** | Visual glitch, minor text error, layout shift |

---

## 13. Known Beta Limitations

The following features are **intentionally incomplete or limited** in this beta version. Do not report these as new bugs.

| # | Limitation | Description |
|---|-----------|-------------|
| 1 | **Password Storage** | Passwords are currently stored in plain text (no hashing). This will be hardened before public release. |
| 2 | **JWT Secret** | A default JWT secret is used. A production-grade random secret will be set before public launch. |
| 3 | **Dark Mode** | The theme toggle in Settings saves the preference but full dark mode CSS coverage is incomplete. Some pages may not fully adapt. |
| 4 | **Real-Time Messaging** | Messages require a manual refresh or page reload to see new incoming messages. WebSocket-based real-time delivery is planned post-beta. |
| 5 | **Email Notifications** | Email notification sending is configured but may not be active depending on SMTP credentials. In-app notifications work. |
| 6 | **File Upload Size** | Item images above 10MB will be rejected. Compress photos before uploading if needed. |
| 7 | **Map View** | The interactive map on item listings shows approximate location only; exact geolocation is not enabled in this build. |
| 8 | **Verification API** | The biometric identity verification uses a simulation engine in beta. Real government ID validation is pending third-party integration. |
| 9 | **CORS Wildcard** | Backend CORS is set to `*` (all origins) for beta convenience. This will be locked to specific domains before production. |
| 10 | **Large JS Bundle** | The frontend JS bundle is ~1.76MB (446KB gzipped). Code splitting will be implemented before full release. |
| 11 | **No HTTPS** | The local beta runs on `http://`. A valid SSL certificate will be required for production deployment. |
| 12 | **AI Chatbot** | The AI assistant requires a valid Gemini API key. It may return an error message if the key is not configured. |

---

## 14. Environment Variables Reference

### Frontend (`/.env.example`)

```env
# Currently no .env required for frontend
# API base URL is set to http://localhost:3001 in service files
```

### Backend (`/backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `3001` | Backend server port |
| `HOST` | Yes | `0.0.0.0` | Backend bind host |
| `ENVIRONMENT` | No | `production` | App environment |
| `DEBUG` | No | `false` | Enable debug mode + reload |
| `JWT_SECRET` | Yes | *(default beta key)* | JWT signing secret |
| `CORS_ORIGINS` | Yes | `*` | Comma-separated allowed origins |
| `MYSQL_HOST` | Yes | `localhost` | MySQL host address |
| `MYSQL_PORT` | Yes | `3307` | MySQL port (Laragon uses 3307) |
| `MYSQL_USER` | Yes | `root` | MySQL username |
| `MYSQL_PASSWORD` | No | *(empty)* | MySQL password |
| `MYSQL_DATABASE` | Yes | `bayanihan_hub` | Target database name |
| `DATABASE_URL` | Yes | *(auto-built)* | Full SQLAlchemy connection string |
| `VERIFICATION_PROVIDER` | No | `biometric` | Identity verification mode |
| `VERIFICATION_API_KEY` | No | *(empty)* | Verification API key |

---

## 15. Git Workflow During Beta

### Checking Current State

```powershell
git log -n 5 --oneline
git status
```

### Pulling Latest Changes (Before Each Session)

```powershell
git pull origin main
```

### After Hotfixes (Push Immediately)

```powershell
git add .
git commit -m "fix(beta): [short description of what was fixed]"
git push origin main
```

### Commit Message Format

| Type | When to Use | Example |
|------|-------------|---------|
| `fix(beta):` | Bug fix during beta | `fix(beta): resolve message not saving on mobile` |
| `feat(beta):` | New feature or improvement | `feat(beta): add password visibility toggle on login` |
| `style:` | CSS/UI only change | `style: fix modal overflow on 320px viewport` |
| `chore:` | Config, docs, deps | `chore: update .env.example with new variable` |

### Repository

- **GitHub:** https://github.com/Jehooooo/BayanihanHub
- **Branch:** `main`
- **Latest Commit:** `9857e4e` — feat(beta): add beta notice to landing page, clean up scope props, and add dark mode + focus support to BetaNoticeModal

---

## Quick Reference — Startup Checklist (For Beta Day)

```
[ ] 1. Open Laragon → Start MySQL (port 3307)
[ ] 2. Open terminal in BayanihanHubAfter/
[ ] 3. Run: npm run dev:all
[ ] 4. Verify: http://localhost:3001/health → {"status": "online"}
[ ] 5. Verify: http://localhost:3001/api/db-health → {"status": "connected"}
[ ] 6. Verify: http://localhost:5173 → Landing page + Beta Notice modal
[ ] 7. Login with: jehosuebiscarra@gmail.com / password123
[ ] 8. Login with: admin account for admin testing
[ ] 9. Begin testing Scenarios A through H
[ ] 10. Report all bugs to: jbiscarra24113423@student.dmmmsu.edu.ph
```

---

*BayanihanHub Beta v1.0.0 — Prepared September 12, 2026*
*Development Team: Jehosue, Christopher, Laurice, Trisha, Leah*
*Stronger Together. Share. Care. Inspire.*
