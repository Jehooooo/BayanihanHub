# 📋 Bayanihan Hub — Tomorrow's Tasks & Engineering Action Plan

**Date:** Monday, September 14, 2026  
**Milestone:** Beta Testing Kickoff & Field Validation (v1.0.0)  
**Lead Developer:** Jehosue Biscarra  
**Testing Team:** Christopher, Laurice, Trisha, Leah  
**Official Team Contact:** `jbiscarra24113423@student.dmmmsu.edu.ph`  
**Current Branch:** `main` | **Build Health:** 🟢 Passing (Vite v8.2.0, 0 TypeScript errors)

---

## 🎯 Executive Overview for Tomorrow

Tomorrow marks the official **Beta Testing Kickoff** for BayanihanHub. Having successfully completed the deployment configuration (Vercel Frontend, Render FastAPI Backend, Aiven Cloud MySQL with SSL, and student admin privacy protections), tomorrow's focus is divided into four synchronized tracks:

1. **Morning Health & Deployment Pre-Flight** — Ensure all local and cloud services, database pools, and test credentials respond with `<200ms` latency.
2. **Team Beta Scenario Execution** — Walk through end-to-end user journeys (Scenarios A through H from the Beta Guide).
3. **Targeted Engineering Sprints** — Implement client-side mobile image compression, profile listing management (reserve/complete), and image lightbox.
4. **Bug Triage & Field Logging** — Catalog feedback and bug reports using the P1–P4 severity framework.

---

## 🚀 Track 1: Morning Pre-Flight & Health Checks (08:00 - 09:30)

| Task | Target Component | Verification Command / URL | Responsible | Status |
|---|---|---|---|:---:|
| **1. Cloud Backend Health** | Render FastAPI | `GET https://bayanihanhub-api.onrender.com/api/db-health` | Jehosue | ⏳ Pending |
| **2. Production Web UI** | Vercel Deployment | `https://bayanihanhub.vercel.app` | Jehosue | ⏳ Pending |
| **3. Local Dev Fallback** | Laragon MySQL (Port 3307) | `npm run dev:all` (FastAPI 3001 + Vite 5173) | Christopher | ⏳ Pending |
| **4. Admin Credential Check** | Auth API | Login as `admin@bayanihan.ph`, `student1@bayanihan.ph`, `student2@bayanihan.ph` | Leah | ⏳ Pending |
| **5. Test User Validation** | Auth API & DB | Login as Juan, Maria, Carlo, Ana | Trisha | ⏳ Pending |
| **6. Privacy Shield Check** | Verification API | Confirm Jehosue's face and ID data are blurred/hidden in admin approvals | Laurice | ⏳ Pending |

---

## 🧪 Track 2: Core User Journey Testing (Scenarios A–H)

### 👤 Scenario A: Registration & Identity Verification Flow
- [ ] Register a new neighbor account using a clean email address.
- [ ] Provide valid barangay and municipality (e.g., Agoo, La Union).
- [ ] Complete the simulated ID upload and biometric camera capture.
- [ ] Verify user is placed into `PENDING` state and prevented from accessing member features.
- [ ] Login as `student1@bayanihan.ph` or `student2@bayanihan.ph` at `/admin/approvals`.
- [ ] Confirm face privacy overlay works and verify that approving transitions the account to `APPROVED`.
- [ ] Log back into the newly approved account and verify full dashboard access.

### 📦 Scenario B: Item Donation & Thumbnail Workflow
- [ ] Navigate to `/post-item` as an approved user.
- [ ] Create a new donation listing with title, condition, category, and description.
- [ ] Upload 3 photos using the photo upload component.
- [ ] Test the **"★ Set as Thumbnail"** feature to designate photo #2 as the primary cover.
- [ ] Verify the item appears immediately on `/browse` with the correct cover photo.
- [ ] Check `/items/:id` to ensure all gallery photos render and open properly.

### 🔄 Scenario C: Peer-to-Peer Barter & Exchange Proposals
- [ ] Switch to a second test account (e.g., Maria Santos).
- [ ] Locate an item marked **"For Exchange"** posted by another user.
- [ ] Click **"Propose Exchange"**, select the item you are offering, and submit terms.
- [ ] Verify the proposal appears in `/exchange` under **Pending Offers**.
- [ ] Switch to the listing owner account:
  - Verify incoming notification alert.
  - Review the **YOU OFFER vs THEY OFFER** comparison card.
  - Test the **Accept**, **Decline**, and **Counter** actions.
  - Verify item status switches to `RESERVED` upon acceptance.

### 🆘 Scenario D: Community Requests & Calamity Assistance
- [ ] Navigate to `/request-item` and submit an urgent request (e.g., "Emergency First Aid Kit & Blankets").
- [ ] Set urgency to **High** or **Critical** with target completion date.
- [ ] Confirm the item displays on `/requests` with the appropriate amber/red urgency badge.
- [ ] From another account, click **"Fulfill This Request"**.
- [ ] Ensure fulfillment status updates and in-app notifications are dispatched to both parties.

### 💬 Scenario E: Direct Messaging & Chat Channels
- [ ] Open any listing and click the **"Message Owner"** action.
- [ ] Send an initial inquiry regarding meetup or item specifications.
- [ ] Verify navigation to `/messages` with active thread selection.
- [ ] Reply from the owner account and confirm two-way communication.
- [ ] Confirm unread message counters in the top navigation header decrement when viewed.

### 🛡️ Scenario F: Admin Moderation & Security
- [ ] Login with administrator credentials.
- [ ] Visit `/admin` and confirm metrics (Total Users, Posts, Active Requests, Pending Approvals).
- [ ] Visit `/admin/users` and test the **Suspend / Unsuspend** toggle on a test account.
- [ ] Visit `/admin/categories` and verify category addition and editing.
- [ ] Open `/admin/reports` to inspect flagged content resolution.

### 📢 Scenario G: Beta Notice Modal Validation
- [ ] Verify the Beta Notice modal appears on initial visit to `/` (Landing Page).
- [ ] Confirm modal contains **NO emojis** (clean SVG icons only per UI guidelines).
- [ ] Verify support email `jbiscarra24113423@student.dmmmsu.edu.ph` is clickable (`mailto:`).
- [ ] Test modal behavior across `/login` and `/dashboard` upon page reload.

### 📱 Scenario H: Mobile Responsiveness (375px Viewport)
- [ ] Open DevTools responsive mode set to **375×812** (iPhone SE / iPhone 14).
- [ ] Verify zero horizontal scrolling (`overflow-x`) across all core routes.
- [ ] Verify floating sidebars collapse cleanly into bottom navigation or mobile drawer.
- [ ] Test tap target sizes for buttons, tabs, and form inputs (minimum 44px height).

---

## 💻 Track 3: Priority Engineering Tasks for Monday

### 🔴 Priority 1: Client-Side Image Compression Pre-Upload
- **Problem:** Uncompressed mobile camera uploads (5MB–12MB) degrade user experience on slow Philippine mobile networks (LTE/3G).
- **Target File:** `src/utils/imageCompression.ts`
- **Implementation:**
  - Implement canvas-based resizing utility `compressImageForUpload(file: File, maxDimension = 1280, quality = 0.82)`.
  - Wire into `PostItemPage.tsx` and `ProfilePictureUploadModal.tsx` before dispatching to `/api/items/upload-image`.
  - Target output size: `<350KB` per photo with imperceptible visual loss.

### 🔴 Priority 2: Owner Listing Management on Profile
- **Problem:** Donors need a quick way to mark their items as Reserved or Donated without opening a database tool.
- **Target Files:**
  - `src/features/profile/pages/ProfilePage.tsx`
  - `src/features/items/components/ItemCard.tsx`
  - `backend/app/routers/items.py`
- **Implementation:**
  - Add contextual owner menu (`...`) on user's own cards:
    - **Mark as Reserved**
    - **Mark as Completed / Donated**
    - **Delete Listing** (with 6-second undo toast notification)
  - Connect to backend `PATCH /api/items/{id}/status`.

### 🟡 Priority 3: Full-Screen Photo Lightbox
- **Problem:** Prospective barterers and beneficiaries need to inspect item details, wear, and labels up close.
- **Target File:** `src/features/items/components/ImageGallery.tsx`
- **Implementation:**
  - Add an expand/zoom button on the active image.
  - Render full-screen overlay with dark translucent background (`backdrop-blur-md`).
  - Add keyboard arrow navigation (`Left` / `Right`) and `Esc` to close.

### 🟢 Priority 4: Frontend Bundle Chunking & Lazy Loading
- **Problem:** Initial bundle size is ~1.78MB (454KB gzip), triggering Vite chunk size warnings.
- **Target File:** `vite.config.ts` & `src/App.tsx`
- **Implementation:**
  - Lazy-load heavy route components (`React.lazy()` for `AdminLayout`, `ExchangePage`, `LiveLocationMap`).
  - Configure Rollup manual chunk splitting for `lucide-react`, `recharts`, and `@googlemaps/js-api-loader`.

---

## 👥 Team Assignments & Responsibilities

| Team Member | Role | Tomorrow's Primary Focus |
|---|---|---|
| **Jehosue Biscarra** | Lead Developer | Cloud API monitoring, image compression implementation, profile listing actions |
| **Christopher** | QA & Auth Lead | Scenarios A & E (Registration, Biometrics, Direct Messaging testing) |
| **Laurice** | Mobile & UI Specialist | Scenario H (375px mobile responsiveness, Beta Modal styling, cross-browser check) |
| **Trisha** | Community Content Lead | Scenarios B & D (Donation postings, urgent community requests, item categorization) |
| **Leah** | Moderation & Admin Lead | Scenarios C & F (Exchange negotiations, Admin Approvals panel, reports audit) |

---

## 🐛 Bug Triage & Severity Matrix

When documenting issues during tomorrow's testing sessions, assign severity according to this standard:

| Severity | Definition | Action Required |
|:---:|---|---|
| **P1 - Critical** | Crash, white screen, inability to login, or data loss. | Stop testing; hotfix deployed immediately. |
| **P2 - High** | Core flow broken (cannot post item, cannot accept exchange) with no workaround. | Assigned and resolved same-day. |
| **P3 - Medium** | Feature works but with visual defects, lag, or non-critical error messages. | Logged in bug tracker for sprint resolution. |
| **P4 - Low** | Minor cosmetic misalignment, typo, or minor copy adjustment. | Batch fixed during polishing phase. |

---

## 🏁 End-of-Day Checklist & Debrief (17:00 - 18:00)

- [ ] Consolidate all tester feedback and bug tickets into central log.
- [ ] Review backend error logs on Render / Laragon Terminal.
- [ ] Confirm no orphaned or unhandled database transactions in Aiven MySQL.
- [ ] Commit all code fixes and push to `origin/main`.
- [ ] Publish Day 1 Beta Summary report for the team.
