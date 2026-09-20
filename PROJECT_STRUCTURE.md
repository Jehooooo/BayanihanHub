# BayanihanHub Project Structure

This document provides a comprehensive overview of the **actual structure** of the BayanihanHub project, detailing the frontend, backend, database, and configuration layers. It serves as a quick reference for developers, maintainers, and AI coding agents.

---

## 1. Project Tree

```text
BayanihanHub/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── routers/           # FastAPI API endpoints
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Business logic and external integrations
│   │   ├── config.py          # Backend configuration and env vars
│   │   ├── db.py              # Database connection and session management
│   │   └── main.py            # FastAPI application entry point
│   ├── db/
│   │   ├── schema.sql         # Main database schema definition
│   │   ├── seed.sql           # Initial seed data
│   │   └── init_db.py         # Script to initialize the database
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Script to run the uvicorn server
│
├── public/                    # Static assets and uploads
│   ├── uploads/               # User-uploaded images (items, messages, profiles)
│   └── icons.svg              # SVG icons
│
├── src/                       # Frontend React Application
│   ├── assets/                # Static frontend assets
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Shared components (SEO, Modals)
│   │   ├── layout/            # Layout wrappers (Header, Sidebar, Footer)
│   │   └── ui/                # Core design system components (Button, Input, Card)
│   ├── data/                  # Static reference data (e.g., categories)
│   ├── features/              # Feature-based modules (pages and specific components)
│   │   ├── admin/             # Admin panel interfaces
│   │   ├── auth/              # Authentication and verification flows
│   │   ├── dashboard/         # Main user dashboard
│   │   ├── exchange/          # Barter and exchange interface
│   │   ├── items/             # Item browsing, creation, and details
│   │   ├── messaging/         # Direct messaging system
│   │   ├── profile/           # User profile and settings
│   │   ├── ratings/           # User rating system
│   │   └── requests/          # Community requests
│   ├── services/              # API interaction layer
│   ├── stores/                # Zustand state management
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── utils/                 # Helper functions (error handling, formatting)
│   ├── App.tsx                # Main React router and layout configuration
│   └── main.tsx               # React application entry point
│
├── package.json               # Node.js dependencies and scripts
├── vite.config.ts             # Vite build configuration
├── render.yaml                # Render deployment configuration (Backend)
└── vercel.json                # Vercel deployment configuration (Frontend)
```

---

## 2. Core Frontend Components & Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Initializes the React application and mounts it to the DOM. |
| `src/App.tsx` | Defines all application routes (`PublicOnlyRoute`, `ProtectedRoute`, `AdminRoute`). |
| `src/components/ui/Button.tsx` | Standardized button component used across the application. |
| `src/features/items/components/ItemCard.tsx` | Displays an individual item listing card (donation/exchange). |
| `src/features/items/pages/BrowsePage.tsx` | Main community browsing interface with filtering. |
| `src/features/messaging/components/ChatWindow.tsx` | Handles real-time direct messaging UI. |
| `src/services/items.service.ts` | Handles API requests related to items (listings). |
| `src/stores/authStore.ts` | Zustand store managing the user's authentication state and JWT. |

---

## 3. Core Backend Components & Files

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI entry point, configures CORS, middleware, and includes routers. |
| `backend/app/db.py` | Sets up the SQLAlchemy database engine and session maker. |
| `backend/app/routers/auth.py` | API endpoints for user registration, login, and token generation. |
| `backend/app/routers/items.py` | API endpoints for creating, retrieving, and updating items. |
| `backend/app/models/user.py` | SQLAlchemy ORM model for the `users` table. |
| `backend/app/models/item.py` | SQLAlchemy ORM model for the `items` table. |
| `backend/app/services/email.py` | Handles sending emails (verification, notifications). |

### Important Classes & Functions

### `backend/app/models/user.py`
**Class:** `User`
> Represents a BayanihanHub user and manages user-related database information.

**Responsibilities:**
- Stores core user account information (email, password hash).
- Links to `account_status_id` and `role_id`.
- Connects users to profiles, items, exchanges, and messages.

### `src/services/items.service.ts`
**Functions:**
- `createItem()` — Submits a new community listing via the API.
- `getItems()` — Retrieves available listings based on filters.
- `getItemById()` — Retrieves detailed information for a specific item.
- `deleteItem()` — Deletes an owned item from the database.
- `saveItem()` / `unsaveItem()` — Toggles an item in the user's saved list.

---

## 4. Frontend Architecture

**Framework:** React 19, Vite, TypeScript
**Styling:** Tailwind CSS 4
**State Management:** Zustand
**Data Fetching/Routing:** React Router DOM, standard `fetch` API via service classes
**Forms:** React Hook Form + Zod validation
**Icons:** Lucide React

### Key Concepts:
- **Routing:** Centralized in `App.tsx` using `react-router-dom`. Routes are protected using wrapper components (`ProtectedRoute` for logged-in users, `AdminRoute` for administrators).
- **Feature-based Structure:** Code is organized by feature (e.g., `src/features/items`) rather than by type, keeping components, pages, and specific logic grouped together.
- **State:** Global state (auth, notifications, chat) is managed by Zustand stores in `src/stores/`.
- **API Services:** Extracted into `src/services/` to keep components clean. They handle the raw `fetch` calls and error mapping.

---

## 5. Backend Architecture

**Framework:** FastAPI (Python)
**Database ORM:** SQLAlchemy
**Driver:** PyMySQL
**Authentication:** JWT (JSON Web Tokens)
**Server:** Uvicorn

### Key Concepts:
- **Application Entry Point:** `backend/app/main.py` orchestrates the app, attaches CORS, and loads routers.
- **Routers:** Located in `backend/app/routers/`, they define the HTTP endpoints and delegate logic to services/models.
- **Models:** Located in `backend/app/models/`, they map directly to the MySQL database tables.
- **Schemas:** Located in `backend/app/schemas/`, they use Pydantic to validate incoming request bodies and format outgoing responses.

---

## 6. Database Schema

The database uses MySQL and is strictly normalized (3NF). Defined in `backend/db/schema.sql`.

### Key Tables & Relationships:
- **`users`**: Core account table. Has roles and account statuses.
- **`profiles`**: Extended user information (bio, location). 1-to-1 with `users`.
- **`items`**: The main listings (donations, exchanges). Belongs to a `user`, references `item_categories`, `item_conditions`, `item_statuses`.
- **`item_requests`**: Community requests for specific needs.
- **`exchanges`**: Tracks barter agreements between users. Links two `users` and multiple `items` (via `exchange_items`).
- **`messages` & `conversation_participants`**: Supports direct user-to-user messaging.
- **`reports`**: Stores user-submitted moderation reports.
- **`ratings`**: User reputation system.

---

## 7. API Structure

The API is RESTful and built with FastAPI. Below are the core endpoint groupings:

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Registers a new user.
- `POST /api/auth/login` — Authenticates a user and returns a JWT.

### Items (`/api/items`)
- `GET /api/items` — Retrieves a paginated/filtered list of items.
- `POST /api/items` — Creates a new item listing.
- `GET /api/items/{id}` — Retrieves item details.
- `DELETE /api/items/{id}` — Deletes a specific item.

### Messaging (`/api/messaging`)
- `GET /api/messaging/conversations` — Retrieves the user's active chats.
- `GET /api/messaging/conversations/{id}/messages` — Retrieves chat history.
- `POST /api/messaging/messages` — Sends a new direct message.

### Admin (`/api/admin`)
- `GET /api/admin/stats` — Retrieves platform-wide statistics.
- `GET /api/admin/users` — Lists users for moderation.
- `PUT /api/admin/users/{id}/status` — Suspends or bans a user.

---

## 8. Authentication & Authorization

**Flow:**
1. **Registration:** User signs up (`/api/auth/register`).
2. **Identity Verification:** (Optional/Required based on configuration) User submits ID/Facial verification.
3. **Login:** User logs in (`/api/auth/login`) and receives a JWT.
4. **Session:** Frontend stores JWT (usually in memory/Zustand or localStorage) and attaches it as a `Bearer` token in the `Authorization` header for subsequent requests.

**Authorization:**
- The backend uses FastAPI `Depends` to extract and verify the JWT.
- `get_current_user` ensures the user is valid.
- `get_admin_user` ensures the user's `role_id` corresponds to an administrator before allowing access to `/api/admin/*` routes.

---

## 9. Feature Map

| Feature | Frontend Implementation | Backend Implementation | Database Tables |
|---|---|---|---|
| Authentication | `src/features/auth/` | `routers/auth.py` | `users`, `roles` |
| Verification | `src/features/auth/components/` | `routers/verification.py`| `identity_verifications` |
| Browse Items | `src/features/items/pages/BrowsePage.tsx` | `routers/items.py` | `items`, `item_images` |
| Messaging | `src/features/messaging/` | `routers/messaging.py` | `messages`, `conversation_participants` |
| Barter/Exchange | `src/features/exchange/` | `routers/exchanges.py` | `exchanges`, `exchange_items` |
| Reports | `src/features/moderation/` | `routers/reports.py` | `reports` |
| Admin Panel | `src/features/admin/` | `routers/admin.py` | (Reads from all tables) |

---

## 10. Admin Panel

The Admin panel is a dedicated section of the application accessible only to users with the 'admin' role.

**Sections:**
- **Dashboard (`AdminDashboardPage.tsx`):** High-level metrics and recent audit logs.
- **Manage Users (`ManageUsersPage.tsx`):** View all users, suspend/ban accounts.
- **Manage Posts (`ManagePostsPage.tsx`):** Moderate items, delete inappropriate listings.
- **Manage Approvals (`ManageApprovalsPage.tsx`):** Review pending identity verifications.
- **Manage Reports (`ManageReportsPage.tsx`):** Review and resolve user-submitted reports.
- **Manage Categories (`ManageCategoriesPage.tsx`):** Manage item classifications.

---

## 11. Messaging

The messaging system facilitates direct communication between users regarding items or exchanges.

**Flow:**
```text
Sender -> ChatWindow.tsx -> MessageInput -> API POST /messages -> Database -> Recipient (polling or WebSocket) -> Notification
```

**Key Files:**
- `src/features/messaging/components/ChatWindow.tsx`: The main chat interface.
- `src/features/messaging/components/ConversationList.tsx`: The list of active chats on the sidebar.
- `backend/app/routers/messaging.py`: API endpoints for sending/retrieving messages.

---

## 12. Image / File Uploads

Images are stored locally on the server (or mounted volume).

**Flow:**
```text
Frontend File Input -> API POST (multipart/form-data) -> Backend saves to `public/uploads/` -> Database stores relative path -> Frontend renders using URL
```

---

## 13. Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node dependencies and frontend scripts. |
| `vite.config.ts` | Frontend build tooling configuration. |
| `tsconfig.json` | TypeScript compiler options. |
| `backend/requirements.txt` | Python backend dependencies. |
| `render.yaml` | Infrastructure-as-code for deploying the backend to Render. |
| `vercel.json` | Configuration for deploying the frontend to Vercel (rewrites for SPA routing). |
| `.env.example` | Template for required environment variables. |

---

## 14. Scripts

Defined in `package.json`:
- `npm run dev` — Starts the Vite frontend development server.
- `npm run backend` — Starts the Python FastAPI backend.
- `npm run dev:all` — Runs both frontend and backend concurrently.
- `npm run build` — Compiles TypeScript and builds the Vite frontend for production.
- `npm run lint` — Runs the `oxlint` linter on the frontend codebase.

---

## 15. Environment Variables

Variables required to run the application (defined in `.env`):

| Variable | Purpose |
|---|---|
| `DB_HOST` | Database connection host |
| `DB_PORT` | Database connection port |
| `DB_USER` | Database authentication user |
| `DB_PASSWORD` | Database authentication password |
| `DB_NAME` | Database schema name |
| `SECRET_KEY` | JWT signing secret key |
| `ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time |
| `CORS_ORIGINS` | Allowed frontend domains for CORS |

*(Note: Never commit actual `.env` files with real values to version control.)*

---

## 16. Deployment

The project is configured for a split deployment architecture:
- **Frontend:** Hosted on Vercel. Configured via `vercel.json` to handle SPA routing (rewriting all paths to `index.html`).
- **Backend:** Hosted on Render (or similar PaaS). Configured via `render.yaml` to run `uvicorn app.main:app`.
- **Database:** Hosted on a managed MySQL provider (e.g., Aiven, PlanetScale, or Render MySQL).

---

## 17. Architecture Summary

BayanihanHub uses:
- **Frontend:** React 19 (Vite)
- **Backend:** FastAPI (Python)
- **Database:** MySQL 8+ (SQLAlchemy)
- **Authentication:** JWT Bearer tokens
- **Storage:** Local filesystem (`public/uploads`) for images
- **Deployment:** Vercel (Frontend), Render (Backend)

The frontend communicates with the backend exclusively via RESTful HTTP calls over the network. The backend validates requests, interacts with the MySQL database via SQLAlchemy, and returns JSON responses.

---

## 18. AI Developer Quick Reference

### If I need to modify...

### Browse posts
Look at:
- `src/features/items/pages/BrowsePage.tsx`
- `src/features/items/components/ItemCard.tsx`
- `backend/app/routers/items.py`

### Post creation
Look at:
- `src/features/items/pages/PostItemPage.tsx`
- `backend/app/routers/items.py` (POST endpoint)

### Messaging
Look at:
- `src/features/messaging/components/ChatWindow.tsx`
- `src/stores/chatStore.ts`
- `backend/app/routers/messaging.py`

### Admin Panel
Look at:
- `src/features/admin/pages/*`
- `backend/app/routers/admin.py`

### Database Schema
Look at:
- `backend/db/schema.sql`
- `backend/app/models/*.py`

### Authentication
Look at:
- `src/features/auth/pages/LoginPage.tsx`
- `src/stores/authStore.ts`
- `backend/app/routers/auth.py`
