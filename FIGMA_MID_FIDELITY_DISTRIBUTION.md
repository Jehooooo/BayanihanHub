# 🎨 Bayanihan Hub — Figma Mid-Fidelity Wireframe Task Distribution

**Project:** Bayanihan Hub (Community Exchange & Donation Platform)  
**Deliverable:** Mid-Fidelity Wireframes in Figma (Desktop 1440px & Mobile 375px)  
**Date Assigned:** September 14, 2026  
**Figma Team Workspace:** BayanihanHub UI/UX Project  
**Target Completion:** Within 3–4 Days

---

## 🎯 Objective & Mid-Fidelity Design Guidelines

Mid-fidelity wireframes bridge the gap between low-fidelity sketches and final high-fidelity prototypes. They establish **information hierarchy, layout structure, content spacing, responsive behavior, and interactive state logic** without getting bogged down by high-res imagery and final decorative styling.

### 📐 Standard Figma Specifications
- **Canvas Artboard Sizes**:
  - **Desktop:** `1440px` width (Content container: `1200px` max, 12-column grid, `24px` gutter, `80px` margin).
  - **Mobile:** `375px` width (iPhone SE/14 baseline, 4-column grid, `16px` gutter, `16px` margin).
- **Color Palette (Restrained / Wireframe Mode)**:
  - **Neutrals / Greyscale:** `#FFFFFF`, `#F8FAFC`, `#E2E8F0`, `#94A3B8`, `#475569`, `#0F172A`.
  - **Brand Primary Accent (Interactive CTAs):** Bayanihan Emerald `#2E7D32` / `#1B5E20`.
  - **Semantic Accents:** Amber `#D97706` (Urgent/Reserved), Crimson `#DC2626` (Critical/Danger), Azure `#2563EB` (Exchanges).
- **Typography:** `Poppins` or `Inter` (12px, 14px, 16px body; 18px, 20px, 24px, 32px headings).
- **Component Anatomy:** Use Figma **Auto Layout** for all containers, buttons, forms, and cards. Use **Lucide Icons** (wireframe vectors).

---

## 👥 Task Distribution Matrix at a Glance

| Member | Assigned Module / Feature Area | Primary Scope & Responsibilities | Key Deliverables |
|---|---|---|:---:|
| **👑 Jehosue** *(User/Lead)* | **Admin & Moderation Panel** | Full admin portal, KPI metrics, user management, identity approval queue with privacy blur, reports & audit logs. | 6 Desktop Screens + Modals |
| **🎨 Laurice** | **Landing Page, Auth & Identity Verification** | Public marketing front, onboarding funnel, multi-step registration, camera selfie capture, and waiting screens. | 6 Desktop + 6 Mobile Screens |
| **📦 Trisha** | **Item Discovery, Browse & Posting** | Search & multi-filter catalog, photo gallery with thumbnail selector, item posting wizard, and saved items. | 5 Desktop + 5 Mobile Screens |
| **🔄 Christopher** | **Barter Exchange & Community Help Requests** | 2-column trade proposals, offer comparison, status lifecycles, and urgent calamity/aid request boards. | 5 Desktop + 5 Mobile Screens |
| **💬 Leah** | **Neighbor Dashboard, Messaging & User Profiles** | Daily neighbor hub, 2-pane real-time chat window, user trust profile, badges, reviews, and settings. | 5 Desktop + 5 Mobile Screens |

---

## 📌 Detailed Member Breakdown & Screen Requirements

---

### 👑 Member 1: Jehosue (Lead Developer)
#### 🛡️ Assigned Area: Complete Admin & Moderation Panel
*Exclusively responsible for designing the desktop administrative back-office system.*

| # | Screen / View Name | Route Equivalent | Core Layout & Wireframe Components |
|---|---|---|---|
| **A1** | **Admin Dashboard Overview** | `/admin` | • Left dark sticky admin sidebar (Dashboard, Approvals, Users, Posts, Requests, Reports, Terminal)<br>• 5 KPI Metric Cards (Total Users, Active Listings, Community Requests, Pending Approvals, Total Trades)<br>• Recent System Activity Table & Quick Action shortcuts |
| **A2** | **Identity Approvals Queue** | `/admin/approvals` | • Filter tabs: `Pending Review`, `Approved`, `Rejected`<br>• Verification review card grid with applicant name, date, submitted ID type<br>• Side-by-side ID Document viewer vs. Selfie Verification camera photo<br>• **Privacy blur toggle/shield** for sensitive photos<br>• "Approve", "Reject with Reason", and "Request Re-upload" action modals |
| **A3** | **Manage Users Directory** | `/admin/users` | • User data table with Search, Role filter (Neighbor, Admin), Status filter (Active, Suspended, Pending)<br>• Columns: Avatar, Full Name, Email, Barangay, Date Joined, Trust Rating, Actions (`...`)<br>• User Suspension Modal (duration, violation notes) |
| **A4** | **Post & Listing Moderation** | `/admin/posts` | • Grid/Table of community items with flags/reports counter<br>• Quick preview drawer (Title, owner, photos, description, condition)<br>• Takedown / Archive Listing action modal with notification prompt to owner |
| **A5** | **Community Requests Moderation** | `/admin/requests` | • List of urgent help requests submitted by neighbors<br>• Filter by Urgency (Critical, High, Medium, Low)<br>• Verification badge toggle (Mark as Official / Verified Community Need) |
| **A6** | **Reports & Audit Logs** | `/admin/reports` & `/admin/terminal` | • Flagged content incident tracker (Reporter, Reported Entity, Category: Scam, Inappropriate, Harassment)<br>• Action resolution state (Resolved, Dismissed, Investigating)<br>• System Audit Log table showing admin actions and timestamped database events |

---

### 🎨 Member 2: Laurice
#### 🌐 Assigned Area: Landing Page, Authentication & Identity Verification Onboarding
*Responsible for the public-facing entry point, neighbor registration journey, and identity verification screens.*

| # | Screen / View Name | Route Equivalent | Core Layout & Wireframe Components |
|---|---|---|---|
| **L1** | **Public Landing Page** | `/` (Desktop & Mobile) | • **Hero Section:** Value proposition headline, subhead, dual CTA buttons ("Join Community", "Browse Items"), and preview mock card<br>• **Live Metrics Bar:** Counter stats (Active Neighbors, Items Donated, Exchanges Completed, Trust Score)<br>• **3-Card Feature Grid:** Donating, Bartering, Requesting<br>• **3-Step How-It-Works:** Step cards with number badges<br>• **Trust & Community Safety Section:** Barangay verification highlight<br>• **CTA Banner & 4-Column Footer** |
| **L2** | **Login Page** | `/login` | • Split-screen or centered card with BayanihanHub logo and tagline<br>• Email & Password input fields with show/hide password eye toggle<br>• "Remember me" checkbox and "Forgot Password?" link<br>• Primary "Sign In" button and "Don't have an account? Register" link<br>• Error validation state (invalid credentials banner) |
| **L3** | **Multi-Step Registration** | `/register` | • Stepper Indicator (Step 1: Account Info → Step 2: Location/Barangay → Step 3: Guidelines Consent)<br>• Input fields: Full Name, Email, Password, Mobile Number<br>• Address dropdowns: Province, Municipality/City, Barangay (with helper tooltip)<br>• Terms of Service & Privacy Policy consent checkbox |
| **L4** | **Forgot & Reset Password** | `/forgot-password` | • Clean modal/page with email input to request reset link<br>• Success confirmation screen ("Check your inbox")<br>• Reset password screen with new password strength indicator |
| **L5** | **ID Document & Biometric Selfie Verification** | `/verify` | • Step 1: ID Type selector (PhilID, Driver's License, Barangay ID, Student ID, Voter's)<br>• Drag-and-drop ID Document Uploader (Front & Back) with guideline checklist<br>• Step 2: Live Camera Selfie Capture frame with oval face positioning guide<br>• Retake photo vs. Confirm capture preview |
| **L6** | **Pending Verification Waiting Screen & Beta Modal** | `/verification-pending` | • Friendly status card: "Your account is currently under review by barangay admins"<br>• Expected timeframe badge (e.g., "Usually takes 2–12 hours")<br>• Allowed features vs. Locked features checklist<br>• **Beta Notice Modal:** Non-intrusive modal with official DMMMSU team contact info |

---

### 📦 Member 3: Trisha
#### 🛍️ Assigned Area: Item Discovery, Browse Catalog, Post Item & Listing Details
*Responsible for the marketplace and donation discovery catalog, photo management, and creation wizards.*

| # | Screen / View Name | Route Equivalent | Core Layout & Wireframe Components |
|---|---|---|---|
| **T1** | **Browse Catalog & Search Hub** | `/browse` (Desktop & Mobile) | • Top Search Bar with instant keyword search and clear button<br>• Filter strip / Sidebar: Categories (Appliances, Clothes, Books, Food, etc.), Post Type (All, Free Donation, For Exchange), Condition (Brand New to Fair), Location/Barangay distance slider<br>• Sorting dropdown (Newest, Nearest, Most Popular)<br>• Item card responsive grid (Image, Condition badge, Title, Category, Distance in km, Owner avatar, Heart bookmark toggle)<br>• Empty state ("No items match your filters") |
| **T2** | **Item Details Page** | `/items/:id` | • **Left Column:** Main photo viewer + thumbnail carousel (multi-image selector), photo zoom icon<br>• **Right Column:** Item Title, Condition rating pill, Post Type badge, Category tag, Date posted<br>• Full Description text container, pickup schedule & delivery terms<br>• Neighbor Owner Card (Avatar, Verified badge, Barangay location, Member since, Trust rating)<br>• Primary Action Buttons: "Request Donation" / "Propose Exchange" / "Message Owner"<br>• Safety guidelines callout banner |
| **T3** | **Post an Item Wizard** | `/post-item` | • **Multi-Photo Uploader:** Drag-and-drop zone supporting up to 5 photos<br>• **Thumbnail Selector:** Cover image badge on 1st photo + "★ Set as Thumbnail" interactive control<br>• Post Type toggle: "Donate for Free" vs. "Open for Exchange / Barter"<br>• Form fields: Title, Category selector, Item Condition selector (5 levels with descriptions), Description textarea<br>• Meetup / Delivery options: "Pickup at Barangay Hall", "Neighbor Meetup", "Drop-off" |
| **T4** | **Saved / Bookmarked Items** | `/saved` | • Bookmarked listings grid with quick "Remove from Saved" heart icon<br>• Availability indicator badge (Available, Reserved, Donated)<br>• Direct CTA on card to open item or contact owner |
| **T5** | **Category Showcase Modal / Drawer** | `/categories` | • Visual category icon tiles with live active item count per category<br>• Mobile bottom-sheet drawer for search filters |

---

### 🔄 Member 4: Christopher
#### 🤝 Assigned Area: Barter Exchange Hub & Community Help Requests
*Responsible for peer-to-peer trade negotiation flows, trade proposal cards, and urgent community assistance boards.*

| # | Screen / View Name | Route Equivalent | Core Layout & Wireframe Components |
|---|---|---|---|
| **C1** | **Item Exchange Hub** | `/exchange` (Desktop & Mobile) | • Tab Navigation: `All Exchanges`, `Pending Offers`, `In Progress`, `Completed`, `Declined`<br>• Filter by: "Offers I Received" vs. "Offers I Sent"<br>• Quick summary pill (e.g., "3 Active Negotiations") |
| **C2** | **Exchange Proposal Card (Offer vs. Request)** | Inside `/exchange` | • **Side-by-Side 2-Column Comparison Layout:**<br>  - **Left Box (THEY OFFER):** Photo thumbnail, Title, Condition, Estimated Value<br>  - **Right Box (YOU OFFER):** Photo thumbnail, Title, Condition, Estimated Value<br>• Trade message / note snippet from requester<br>• Proposed Meetup Location & Schedule<br>• Interactive Action Buttons: "Accept Offer", "Counter-Offer", "Decline", "Message Partner" |
| **C3** | **Propose Exchange Modal** | Triggered from `/items/:id` | • Target item summary banner<br>• "Select which of your items you want to offer" dropdown / card selector with thumbnail preview<br>• Additional barter terms / note textarea<br>• Proposed meeting spot dropdown (e.g., Barangay Hall, Covered Court)<br>• "Submit Trade Proposal" primary button |
| **C4** | **Community Requests Feed** | `/requests` (Desktop & Mobile) | • Header with "Need assistance? Submit a Community Request" CTA button<br>• Urgency filter pills: `All`, `🔴 Critical`, `🟠 High`, `🟡 Medium`, `🟢 Low`<br>• Request Cards: Urgency badge, Category, Request Title, Beneficiary count (e.g., "3 Families affected"), Target date, Progress bar (e.g., "2 of 5 fulfilled"), Requester avatar with barangay badge<br>• "Fulfill This Request" primary CTA button |
| **C5** | **Request Help Creation Form / Modal** | `/request-item` | • Request Title & Category selector (e.g., School Supplies, Medical, Calamity Relief, Food)<br>• Urgency Level radio buttons with visual color coding<br>• Number of beneficiaries / items needed<br>• Detailed description & circumstance explanation<br>• Delivery / drop-off location address in the barangay |

---

### 💬 Member 5: Leah
#### 🏡 Assigned Area: Neighbor Dashboard, Messaging Center, Profile & Settings
*Responsible for the core authenticated dashboard, direct chat UI, user trust profiles, reviews, and preference settings.*

| # | Screen / View Name | Route Equivalent | Core Layout & Wireframe Components |
|---|---|---|---|
| **M1** | **Neighbor Dashboard** | `/dashboard` (Desktop & Mobile) | • **Welcome Banner:** "Mabuhay, [User]! Welcome to Barangay [Name] Hub"<br>• **Quick Action Buttons:** "Post an Item", "Request Help", "Browse Donations"<br>• **4 Personal Stats Cards:** Active Posts, Ongoing Exchanges, Completed Donations, Community Rating<br>• **"Nearby in Your Barangay":** 3-card preview of newest local items<br>• **"Urgent Help Needed":** Highlight banner for 1-2 critical community requests |
| **M2** | **Direct Messaging Center (Dual-Pane)** | `/messages` (Desktop) | • **Left Pane (Conversation List):** Search conversations, online status dot (green/grey), last message snippet, timestamp, unread counter badge<br>• **Right Pane (Active Chat):** Header with chat partner name, avatar, verified shield, and listing reference pill (e.g., *"Discussing: Electric Fan"*); Chat bubble feed (Incoming vs. Outgoing with timestamps); Message Input bar with file attachment icon, emoji trigger, and send button |
| **M3** | **Mobile Messaging View** | `/messages` (Mobile 375px) | • Screen A: Standalone conversation thread list<br>• Screen B: Full-screen chat conversation view with back navigation arrow |
| **M4** | **User Profile & Community Trust Center** | `/profile` (Desktop & Mobile) | • Header Banner with overlapping avatar, edit profile picture modal trigger, verified neighbor badge, barangay and municipality<br>• **Trust Stats Pill:** Star Rating (`★ 4.9`), Total Donations, Total Exchanges, Member Since<br>• Community Badges showcase (e.g., *Top Donor*, *Reliable Neighbor*, *Barangay Leader*)<br>• **Tabbed Content:**<br>  - Tab 1: "My Listed Items" (with owner actions: Mark Reserved, Mark Completed, Edit, Delete)<br>  - Tab 2: "Saved Items"<br>  - Tab 3: "Reviews & Ratings" (review cards with star rating, date, reviewer avatar, comment) |
| **M5** | **Settings & Notification Center** | `/settings` & `/notifications` | • **Settings Page:** Personal info form (Phone number, bio, address), Password update form, Notification preferences (Email, In-App), Account deletion / Deactivation zone<br>• **Notifications Center (Modal & View):** Chronological notification list categorized by Exchange Updates, Admin Verification status, and System Announcements with "Mark all as read" button |

---

## 📅 Recommended 4-Day Execution Timeline

```
┌─────────────────────────┬─────────────────────────────────────────────────────────┐
│ Day / Milestone         │ Key Focus & Deliverables                                │
├─────────────────────────┼─────────────────────────────────────────────────────────┤
│ Day 1 (Setup & Tokens)  │ • All members join Figma project canvas                 │
│                         │ • Establish shared Figma Component Library (Buttons,    │
│                         │   Input fields, Badges, Header, and Sidebar)            │
├─────────────────────────┼─────────────────────────────────────────────────────────┤
│ Day 2 (Desktop Wireframes)│ • Jehosue: A1 - A3 (Admin Dashboard, Approvals, Users) │
│                         │ • Laurice: L1 - L3 (Landing Page, Login, Register)      │
│                         │ • Trisha: T1 - T3 (Browse, Item Details, Post Item)     │
│                         │ • Christopher: C1 - C3 (Exchange Hub & Proposal Cards)  │
│                         │ • Leah: M1 - M3 (Dashboard & Real-time Messaging)       │
├─────────────────────────┼─────────────────────────────────────────────────────────┤
│ Day 3 (Mobile & Modals) │ • Complete remaining screens and modals                 │
│                         │ • Create 375px Mobile responsive frames                 │
│                         │ • Jehosue completes A4 - A6 (Posts, Reports, Logs)      │
├─────────────────────────┼─────────────────────────────────────────────────────────┤
│ Day 4 (Review & Sync)   │ • Team design review & spacing audit                    │
│                         │ • Link basic Figma prototype connections (Click-through)│
│                         │ • Export frames for documentation & presentation        │
└─────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Figma Best Practices Checklist for the Team

- [ ] **Auto Layout Everything:** Do not use absolute positioning on frames that need to scale. Use Figma Auto Layout (`Shift + A`) with standard paddings (`8px`, `16px`, `24px`).
- [ ] **Consistent Naming:** Name your frames clearly (e.g., `Desktop / Browse Catalog`, `Mobile / Post Item - Step 1`).
- [ ] **No Placeholder Text (No Lorem Ipsum):** Use real barangay, item, and user names (e.g., *"Juan Dela Cruz"*, *"Brgy. San Nicolas, Agoo"*, *"Stand Fan 16-inch"*).
- [ ] **Interactive States:** Provide at least one example of **Default**, **Hover / Active**, and **Error / Empty** state for your components.
- [ ] **Figma Design System Components:** Always detach or use master components from the shared UI Library to prevent inconsistency across frames.
