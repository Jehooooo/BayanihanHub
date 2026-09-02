# Bayanihan Hub Full Project Documentation



---

## 📑 Table of Contents

1. [Executive Summary & Purpose](#-executive-summary--purpose)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Design System & Layout Engine](#-design-system--layout-engine)
5. [Feature Modules & Functionality](#-feature-modules--functionality)
   - [Landing Page](#1-landing-page)
   - [Authentication System](#2-authentication-system)
   - [Neighbor Dashboard](#3-neighbor-dashboard)
   - [Browse & Item Search](#4-browse--item-search)
   - [Post an Item](#5-post-an-item)
   - [Community Requests](#6-community-requests)
   - [Item Exchange System](#7-item-exchange-system)
   - [Real-Time Messaging](#8-real-time-messaging)
   - [User Profile & Ratings](#9-user-profile--ratings)
   - [Admin Panel & Moderation](#10-admin-panel--moderation)
6. [State Management & Data Flow](#-state-management--data-flow)
7. [Getting Started & Local Development](#-getting-started--local-development)
8. [20-Day Project Implementation & Progress Log](#-20-day-project-implementation--progress-log)

---

## 🎯 Executive Summary & Purpose

The traditional spirit of **Bayanihan** (communal unity and cooperation) is brought to the digital age. **Bayanihan Hub** enables neighbors within the same barangay or municipality to:
- **Donate** surplus household goods, clothes, textbooks, or appliances directly to community members in need.
- **Exchange** items they no longer use for goods offered by fellow neighbors.
- **Request** urgent assistance for essential items (e.g., medical supplies, school textbooks, tools) during times of need or disaster.
- **Build Trust** through verified neighbor accounts, location tagging, and community ratings.

---

## 🛠️ Technology Stack

| Layer | Technology | Usage / Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | UI Component architecture with strict typing |
| **Build Tool** | Vite | Lightning-fast HMR dev server & bundle optimizer |
| **Routing** | React Router v6 | Client-side page navigation & layout routing |
| **State Management** | Zustand | Lightweight global stores for Auth, Chat, & Notifications |
| **Iconography** | Lucide React | Modern, clean vector iconography |
| **Notifications** | React Hot Toast | Real-time interactive toast feedback |
| **Styling & System** | CSS Variables + Inline Flex/Grid Layouts | Reliable visual formatting with zero layout collapse |

---

## 📁 Architecture & Folder Structure

```text
BayanihanHub/
├── public/                     # Static assets & placeholder images
├── src/
│   ├── components/             # Reusable global UI & Layout components
│   │   ├── layout/             # Header, Sidebar, Footer, PageLayout, AuthLayout, AdminLayout
│   │   └── ui/                 # Avatar, Badge, Button, Card, Input, Modal, SearchBar, Select, Tabs, Textarea
│   ├── data/                   # Mock datasets (categories, items, requests, exchanges, users)
│   ├── features/               # Feature-based module organization
│   │   ├── admin/              # Admin Panel, Moderation, User/Post Management
│   │   ├── auth/               # Login, Register, Forgot Password
│   │   ├── dashboard/          # Main Neighbor Dashboard
│   │   ├── exchange/           # Item Exchange Proposal System
│   │   ├── items/              # Browse Items, Post Item, Item Details
│   │   ├── landing/            # Landing Page
│   │   ├── messaging/          # Chat Window & Conversation List
│   │   ├── profile/            # User Profile, Badges, & Settings
│   │   └── requests/           # Community Request System
│   ├── services/               # Mock API services (items, requests, exchange, chat)
│   ├── stores/                 # Zustand global stores (authStore, chatStore, notificationStore)
│   ├── types/                  # TypeScript interface & type definitions
│   ├── App.tsx                 # App router configuration
│   ├── index.css               # Global CSS tokens & resets
│   └── main.tsx                # Entry point
├── DOCUMENTATION.md            # Comprehensive project documentation
├── index.html                  # HTML template
├── package.json                # Dependencies & scripts
└── vite.config.ts              # Vite config
```

---

## 🎨 Design System & Layout Engine

To guarantee consistent rendering and prevent visual collapse across browser engines, the application implements a dedicated **CSS Token & Layout System**:

### CSS Variables (`src/index.css`)
- **Primary Color Palette**: Emerald Green (`#2e7d32`, `#1b5e20`, `#e8f5e9`) representing sustainability and Philippine community growth.
- **Neutral Shades**: Slate & Neutral tones (`#f8faf9`, `#f1f5f3`, `#0f172a`) for crisp readability.
- **Accent & Alerts**: Warm Amber (`#d97706`) for warnings/high urgency, Crimson (`#d32f2f`) for errors/critical items, and Azure (`#2563eb`) for exchanges.
- **Elevation & Radii**: Unified `--radius-sm` through `--radius-xl` and shadow tokens (`--shadow-card`, `--shadow-elevated`).

### Robust Inline Layout Guarantee
All core grid containers, sidebars, forms, card stacks, and navigation headers leverage explicit **CSS Flexbox** and **CSS Grid** rules to ensure flawless alignment and zero text overlap.

---

## 🚀 Feature Modules & Functionality

### 1. Landing Page
- **Hero Banner**: Highlighting *"Stronger Together. Share. Care. Inspire."* with dual call-to-action buttons (*Join the Community* and *Browse Available Items*).
- **Interactive Visual Card**: Real-time demonstration preview showing item donations with distance indicators.
- **Statistics Counter Bar**: Live metric counters for *Active Neighbors (1,240+)*, *Items Donated (890+)*, *Exchanges Done (630+)*, and *Community Trust (99%)*.
- **Feature Highlights Grid**: 3-card breakdown explaining *Item Donations*, *Item Exchange*, and *Community Requests*.
- **3-Step How It Works**: Visual numbered step flow (*Create Account → Post or Browse → Connect & Exchange*).
- **CTA Section & Footer**: Full community footer with quick links, company policy pages, and legal notices.

### 2. Authentication System
- **AuthLayout Wrapper**: Clean, centered backdrop design supporting wide multi-column registration.
- **Register View**: Comprehensive form capturing full name, email, password, address, barangay, municipality, and province.
- **Login View**: Secure credential access with password toggles and account state hydration.
- **Forgot Password**: Password reset submission workflow with instant feedback.

### 3. Neighbor Dashboard
- **Welcome Hero Banner**: Personalized greeting with neighbor name, barangay tagline, and quick action shortcuts.
- **Quick Stats Grid**: 4 key indicator cards tracking *Active Posts*, *Exchanges*, *Donations*, and *Star Rating*.
- **Nearby Items & Donations**: 3-column card grid displaying recently listed local items.
- **Urgent Community Requests**: Highlighted urgent neighbor requests requiring immediate assistance.

### 4. Browse & Item Search
- **Filter Bar**: Dynamic filter controls by keyword, post type (All / Donation / Exchange), category, and sort order (Newest / Distance / Popularity).
- **Item Cards**: Image display with fallback tags, condition badges, distance indicator (`km`), owner avatar, and favorite heart toggle.

### 5. Post an Item
- **Multi-Photo Upload**: Attach up to 5 item photos with instant preview thumbnails and remove controls.
- **Form Controls**: Title, category select, condition rating (*Brand New*, *Like New*, *Good Condition*, *Fair*, *Poor*), post type selector, description, delivery options, and schedule availability.

### 6. Community Requests
- **Urgency Levels**: Visual color badges for *Critical*, *High*, *Medium*, and *Low* urgency.
- **Request Metadata**: Target completion dates, barangay location, and request owner info.
- **Creation Modal**: In-app modal form allowing users to submit new community help requests.

### 7. Item Exchange System
- **Tab Navigation**: Filter exchanges by *All Exchanges*, *Pending Offers*, *In Progress*, and *Completed*.
- **Offer Comparison Grid**: Clear 2-column breakdown contrasting **YOU OFFER** against **THEY OFFER**.
- **Lifecycle Management**: Action buttons to *Accept Exchange*, *Decline*, or *Mark Completed*.

### 8. Real-Time Messaging
- **Conversation List**: Searchable sidebar listing neighbor conversations with online indicator status and recent message snippets.
- **Chat Window**: Responsive chat view featuring partner header info, active online status dot, and styled incoming vs. outgoing chat bubbles.
- **Message Input**: Styled message bar with attachment button, emoji picker, text input, and send button.

### 9. User Profile & Ratings
- **Profile Header Card**: Gradient banner with avatar overlap, verified shield badge, and barangay location.
- **Neighbor Stats Bar**: Summary pill displaying user rating (`★ 4.8`), total completed exchanges, and total donations.
- **Community Badges**: Earned trust badges (e.g., *Trusted Donor*, *Community Star*).
- **Tabs View**: Switch between *My Listed Items*, *Saved Items*, and *Reviews & Ratings*.

### 10. Admin Panel & Moderation
- **Dedicated Admin Layout**: Dark navigation sidebar with quick switcher back to the main app and admin sign-out.
- **Admin Dashboard**: 5-metric overview grid (*Total Users*, *Total Posts*, *Active Requests*, *Pending Approvals*, *Completed Exchanges*) and recent activity logs.
- **User Management**: Searchable user table with one-click *Suspend* / *Unsuspend* actions.
- **Post Moderation**: Table view to inspect and remove reported or violating listings.
- **Category Management**: Category list with form to create new item classification categories.
- **Reports Moderation**: Review user-submitted violation reports with one-click resolution status.

---

## 🔄 State Management & Data Flow

- **Auth Store (`authStore.ts`)**: Persists current authenticated user session, registration details, and profile metrics.
- **Chat Store (`chatStore.ts`)**: Manages active chat selection, message histories, typing states, and message dispatch.
- **Notification Store (`notificationStore.ts`)**: Tracks unread notification counts and alert triggers.

---

## ⚡ Getting Started & Local Development

### Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **npm** or **yarn**

### Installation Steps

1. **Clone or Navigate to Project Directory**:
   ```bash
   cd c:\Users\Jeho\Documents\BayanihanHub
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 📅 20-Day Project Implementation & Progress Log

| Day | Focus Area | Tasks Completed | Status |
| :---: | :--- | :--- | :---: |
| **Day 1** | **Project Setup & Architecture** | • Initialized Vite + React 18 + TypeScript environment<br>• Configured project directory structure (`features/`, `components/`, `stores/`)<br>• Installed Lucide React, Zustand, React Router v6, and React Hot Toast | `Completed` |
| **Day 2** | **Design System & CSS Tokens** | • Defined CSS color tokens for Emerald Green, Slate Neutrals, and Alert colors<br>• Configured custom Google Font (`Poppins`) in `index.html`<br>• Created reusable UI primitives (`Button`, `Badge`, `Avatar`) | `Completed` |
| **Day 3** | **Base Layout & Header/Footer** | • Built `Header` component with logo branding, search trigger, and notifications<br>• Designed `Footer` component with 4-column link layout and copyright notice<br>• Established main `PageLayout` wrapper with sticky desktop sidebar | `Completed` |
| **Day 4** | **Auth Layout & Login UI** | • Created `AuthLayout` wrapper with centered card container<br>• Built `LoginPage` UI with email/password input validation<br>• Added password toggle visibility functionality | `Completed` |
| **Day 5** | **Register & Password Reset** | • Implemented multi-column `RegisterPage` form with Barangay & Municipality inputs<br>• Created `ForgotPasswordPage` UI<br>• Connected auth routing in `App.tsx` | `Completed` |
| **Day 6** | **Global State & Mock Services** | • Implemented `authStore` for user sessions<br>• Built `itemsService` and `requestsService` for local data fetching<br>• Populated initial mock datasets for items, users, and requests | `Completed` |
| **Day 7** | **Landing Page Hero Section** | • Built `LandingPage` Hero section with headline and CTA buttons<br>• Designed interactive visual demo item preview card<br>• Added verified neighbor feature checkmark badges | `Completed` |
| **Day 8** | **Landing Page Features & Stats** | • Implemented 4-metric statistics counter bar (*1,240+ Active Neighbors*)<br>• Built 3-card feature grid for *Item Donations*, *Exchanges*, and *Requests*<br>• Ensured section text alignment and headers | `Completed` |
| **Day 9** | **Landing Page Steps & Banner** | • Built 3-step "How It Works" workflow cards with numbered badges<br>• Created primary CTA callout banner (*Ready to make a difference?*)<br>• Formatted full landing page responsive grid | `Completed` |
| **Day 10** | **Neighbor Dashboard Page** | • Built `DashboardPage` featuring personalized welcome hero banner<br>• Implemented 4 quick stats cards (*Active Posts*, *Exchanges*, *Donations*, *Rating*)<br>• Integrated nearby listings and urgent request previews | `Completed` |
| **Day 11** | **Browse Items & Search Filters** | • Created `BrowsePage` with dynamic query param search support<br>• Built `FilterBar` with category dropdowns, post type tabs, and sorting<br>• Integrated `SkeletonCard` loading states | `Completed` |
| **Day 12** | **Item Card Component & Details** | • Refactored `ItemCard` component with image fallback placeholders<br>• Added favorite heart toggle button with toast alerts<br>• Displayed distance indicators and owner avatar tags | `Completed` |
| **Day 13** | **Post Item Creation Workflow** | • Built `PostItemPage` with multi-photo attachment previews<br>• Created `Select` and `Textarea` UI components<br>• Formatted item condition ratings, pickup options, and schedule fields | `Completed` |
| **Day 14** | **Community Requests Module** | • Built `RequestsPage` with status tabs (*Active*, *In Progress*, *Completed*)<br>• Implemented urgency level color badges (*Critical*, *High*, *Medium*, *Low*)<br>• Created in-app modal form to submit new neighbor requests | `Completed` |
| **Day 15** | **Item Exchange Proposal System** | • Built `ExchangePage` tracking exchange proposals<br>• Created `ExchangeCard` component with 2-column **YOU OFFER vs THEY OFFER** comparison<br>• Added status update actions (*Accept*, *Decline*, *Mark Completed*) | `Completed` |
| **Day 16** | **Real-Time Messaging System** | • Built `MessagingPage` layout with dual-pane chat view<br>• Implemented `ConversationList` sidebar with online status indicators<br>• Created `chatStore` Zustand store for real-time state | `Completed` |
| **Day 17** | **Chat Window & Message Input** | • Refactored `ChatWindow` with partner header info and message bubbles<br>• Created `MessageInput` with paperclip attachment and emoji triggers<br>• Added auto-scroll to latest message functionality | `Completed` |
| **Day 18** | **User Profile & Trust Badges** | • Built `ProfilePage` with gradient cover header and avatar overlay<br>• Created neighbor stats pill container (`★ 4.8 Rating`, `18 Exchanges`)<br>• Added earned trust badges (*Trusted Donor*) and reviews tab | `Completed` |
| **Day 19** | **Admin Panel & Moderation Tools** | • Built `AdminLayout` with dark sidebar navigation<br>• Created `AdminDashboardPage` 5-metric stats grid and activity logs<br>• Implemented `ManageUsersPage` with suspend/unsuspend table actions | `Completed` |
| **Day 20** | **UI Layout Optimization & Documentation** | • Converted all page layouts to explicit inline CSS Flexbox & CSS Grid rules<br>• Resolved layout collapse and cramped spacing issues across all pages<br>• Created comprehensive `DOCUMENTATION.md` with full project specifications and 20-day log | `Completed` |

---


