# Bayanihan Hub Database Architecture & 3NF Data Dictionary

This document details the complete, normalized relational database architecture for **Bayanihan Hub** implemented in **MySQL (InnoDB, utf8mb4)**.

> [!NOTE]
> Per explicit user requirements, all AI-related tables and assistant chat histories have been excluded from this release.

---

## 1. Third Normal Form (3NF) Compliance Guarantees

Every entity in this database strictly adheres to Third Normal Form:

### 1.1 First Normal Form (1NF)
- **Atomic Values**: No composite or compound attributes are stored in a single column (e.g., street address, barangay, municipality, province, and coordinates are split into discrete fields).
- **No Repeating Groups or Arrays**: Multi-value collections from the frontend (e.g., photo galleries, pickup methods, participant lists, earned badges) are isolated into dedicated relation tables (`item_images`, `request_images`, `item_pickup_options`, `user_badges`, `exchange_participants`, `conversation_participants`).

### 1.2 Second Normal Form (2NF)
- **Satisfies 1NF**.
- **No Partial Dependencies on Composite Keys**: In all junction tables with composite primary keys (`saved_items(user_id, item_id)`, `user_roles(user_id, role_id)`, `user_badges(user_id, badge_id)`, `conversation_participants(conversation_id, user_id)`, `exchange_participants(exchange_id, user_id)`), any non-key attributes (such as `saved_at`, `assigned_at`, `earned_at`, `last_read_at`, `participant_role`) depend strictly upon the **entire composite key**, not any individual subset of it.

### 1.3 Third Normal Form (3NF)
- **Satisfies 2NF**.
- **No Transitive Dependencies**: Non-key attributes never depend on another non-key attribute. 
  - Statuses (`account_statuses`, `item_statuses`, `request_statuses`, `exchange_statuses`, `verification_statuses`, `profile_picture_statuses`), types (`item_types`, `id_types`, `message_types`, `notification_types`), and categories (`item_categories`, `item_conditions`) are normalized into reference tables.
  - No entity duplicates names or descriptions belonging to another entity (e.g., `items` does not store `owner_name` or `category_name`; `reports` does not store `reporter_name`). All such values are resolved through joins with referential integrity constraints.

---

## 2. Comprehensive Relationship Summary

| Parent Entity | Child Entity | Relationship | Foreign Key | Delete Rule | Update Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `account_statuses` | `users` | 1:M | `users.account_status_id` | RESTRICT | CASCADE |
| `users` | `profiles` | 1:1 | `profiles.user_id` | CASCADE | CASCADE |
| `users` | `user_roles` | 1:M (M:N) | `user_roles.user_id` | CASCADE | CASCADE |
| `roles` | `user_roles` | 1:M (M:N) | `user_roles.role_id` | RESTRICT | CASCADE |
| `users` | `user_badges` | 1:M (M:N) | `user_badges.user_id` | CASCADE | CASCADE |
| `badges` | `user_badges` | 1:M (M:N) | `user_badges.badge_id` | RESTRICT | CASCADE |
| `users` | `profile_pictures` | 1:M | `profile_pictures.user_id` | CASCADE | CASCADE |
| `profile_picture_statuses` | `profile_pictures` | 1:M | `profile_pictures.status_id` | RESTRICT | CASCADE |
| `users` | `identity_verifications` | 1:M | `identity_verifications.user_id` | CASCADE | CASCADE |
| `id_types` | `identity_verifications` | 1:M | `identity_verifications.id_type_id` | RESTRICT | CASCADE |
| `facial_verification_statuses` | `identity_verifications` | 1:M | `identity_verifications.facial_verification_status_id` | RESTRICT | CASCADE |
| `verification_statuses` | `identity_verifications` | 1:M | `identity_verifications.verification_status_id` | RESTRICT | CASCADE |
| `users` | `items` | 1:M | `items.owner_id` | CASCADE | CASCADE |
| `item_categories` | `items` | 1:M | `items.category_id` | RESTRICT | CASCADE |
| `item_conditions` | `items` | 1:M | `items.condition_id` | RESTRICT | CASCADE |
| `item_types` | `items` | 1:M | `items.item_type_id` | RESTRICT | CASCADE |
| `item_statuses` | `items` | 1:M | `items.item_status_id` | RESTRICT | CASCADE |
| `item_locations` | `items` | 1:M | `items.location_id` | RESTRICT | CASCADE |
| `items` | `item_images` | 1:M | `item_images.item_id` | CASCADE | CASCADE |
| `items` | `item_pickup_options` | 1:M | `item_pickup_options.item_id` | CASCADE | CASCADE |
| `users` | `saved_items` | 1:M (M:N) | `saved_items.user_id` | CASCADE | CASCADE |
| `items` | `saved_items` | 1:M (M:N) | `saved_items.item_id` | CASCADE | CASCADE |
| `users` | `item_requests` | 1:M | `item_requests.user_id` | CASCADE | CASCADE |
| `item_categories` | `item_requests` | 1:M | `item_requests.category_id` | RESTRICT | CASCADE |
| `request_urgencies` | `item_requests` | 1:M | `item_requests.urgency_id` | RESTRICT | CASCADE |
| `request_statuses` | `item_requests` | 1:M | `item_requests.request_status_id` | RESTRICT | CASCADE |
| `item_locations` | `item_requests` | 1:M | `item_requests.location_id` | RESTRICT | CASCADE |
| `item_requests` | `request_images` | 1:M | `request_images.request_id` | CASCADE | CASCADE |
| `exchange_statuses` | `exchanges` | 1:M | `exchanges.exchange_status_id` | RESTRICT | CASCADE |
| `exchanges` | `exchange_participants` | 1:M (M:N) | `exchange_participants.exchange_id` | CASCADE | CASCADE |
| `users` | `exchange_participants` | 1:M (M:N) | `exchange_participants.user_id` | RESTRICT | CASCADE |
| `exchanges` | `exchange_items` | 1:M (M:N) | `exchange_items.exchange_id` | CASCADE | CASCADE |
| `items` | `exchange_items` | 1:M (M:N) | `exchange_items.item_id` | RESTRICT | CASCADE |
| `users` | `exchange_items` | 1:M | `exchange_items.offered_by_user_id` | RESTRICT | CASCADE |
| `exchanges` | `exchange_history` | 1:M | `exchange_history.exchange_id` | CASCADE | CASCADE |
| `conversations` | `conversation_participants` | 1:M (M:N) | `conversation_participants.conversation_id` | CASCADE | CASCADE |
| `users` | `conversation_participants` | 1:M (M:N) | `conversation_participants.user_id` | CASCADE | CASCADE |
| `conversations` | `messages` | 1:M | `messages.conversation_id` | CASCADE | CASCADE |
| `users` | `messages` | 1:M | `messages.sender_id` | RESTRICT | CASCADE |
| `message_types` | `messages` | 1:M | `messages.message_type_id` | RESTRICT | CASCADE |
| `users` | `notifications` | 1:M | `notifications.user_id` | CASCADE | CASCADE |
| `notification_types` | `notifications` | 1:M | `notifications.notification_type_id` | RESTRICT | CASCADE |
| `exchanges` | `ratings` | 1:M | `ratings.exchange_id` | CASCADE | CASCADE |
| `users` | `ratings` (rater) | 1:M | `ratings.rater_id` | RESTRICT | CASCADE |
| `users` | `ratings` (rated) | 1:M | `ratings.rated_user_id` | RESTRICT | CASCADE |
| `users` | `reports` | 1:M | `reports.reporter_id` | RESTRICT | CASCADE |
| `report_reasons` | `reports` | 1:M | `reports.reason_id` | RESTRICT | CASCADE |
| `report_statuses` | `reports` | 1:M | `reports.status_id` | RESTRICT | CASCADE |
| `report_target_types` | `reports` | 1:M | `reports.target_type_id` | RESTRICT | CASCADE |
| `users` | `audit_logs` | 1:M | `audit_logs.admin_id` | RESTRICT | CASCADE |
| `audit_actions` | `audit_logs` | 1:M | `audit_logs.action_id` | RESTRICT | CASCADE |

---

## 3. Data Dictionary: Tables & Domain Specifications

### 3.1 Domain 1: Authentication & Authorization

#### `account_statuses`
- **Purpose**: Defines discrete lifecycle states for a registered account.
- **Primary Key**: `account_status_id` (TINYINT UNSIGNED)
- **Unique Keys**: `status_code` (`PENDING`, `APPROVED`, `REJECTED`, `REQUIRES_REVIEW`)
- **Business Rule**: Every new user account defaults strictly to `PENDING` (status_id = 1). Only an administrator can change it to `APPROVED` (status_id = 2).

#### `users`
- **Purpose**: Central authentication and credentials entity.
- **Primary Key**: `user_id` (BIGINT UNSIGNED AUTO_INCREMENT)
- **Foreign Keys**: `account_status_id` -> `account_statuses(account_status_id)`
- **Unique Keys**: `email` (VARCHAR(191))
- **Important Indexes**: `idx_users_account_status`
- **Business Rule**: Passwords must be securely hashed with BCrypt/Argon2. The account status is checked server-side prior to issuing JWTs or session tokens.

#### `roles`
- **Purpose**: Defines system authorization roles (`admin`, `user`, `guest`).
- **Primary Key**: `role_id` (TINYINT UNSIGNED)
- **Unique Keys**: `role_name`

#### `user_roles`
- **Purpose**: Normalized Many-to-Many junction table granting roles to users.
- **Primary Key**: `(user_id, role_id)` (Composite PK)
- **Foreign Keys**: 
  - `user_id` -> `users(user_id)` ON DELETE CASCADE
  - `role_id` -> `roles(role_id)` ON DELETE RESTRICT

---

### 3.2 Domain 2: User Profiles, Badges & Avatars

#### `profiles`
- **Purpose**: Stores 1:1 user personal information, contact numbers, and neighborhood location.
- **Primary Key**: `profile_id` (BIGINT UNSIGNED AUTO_INCREMENT)
- **Foreign Keys**: `user_id` -> `users(user_id)` ON DELETE CASCADE (UNIQUE)
- **Unique Keys**: `username` (VARCHAR(64))
- **Indexes**: `idx_profiles_location (municipality, barangay)`

#### `profile_pictures`
- **Purpose**: Tracks user avatar photo uploads and moderator approval history.
- **Primary Key**: `profile_picture_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `user_id` -> `users(user_id)` ON DELETE CASCADE
  - `status_id` -> `profile_picture_statuses(status_id)`
  - `reviewed_by` -> `users(user_id)` ON DELETE SET NULL
- **Business Rule**: Only approved profile pictures (`status_id = 2`, `is_active = TRUE`) are displayed as active user avatars.

#### `badges` & `user_badges`
- **Purpose**: Manages community achievement badges (`Trusted Donor`, `Community Star`, etc.).
- **Primary Key**: `(user_id, badge_id)` composite key on `user_badges`.

---

### 3.3 Domain 3: Identity & Facial Verification

#### `id_types`
- **Purpose**: Catalog of all 16 accepted Philippine government IDs with validation format rules.
- **Primary Key**: `id_type_id` (SMALLINT UNSIGNED)
- **Unique Keys**: `type_name`

#### `identity_verifications`
- **Purpose**: Stores complete applicant identity submissions, biometric verification engine results, and administrator moderation audits.
- **Primary Key**: `identity_verification_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `user_id` -> `users(user_id)` ON DELETE CASCADE
  - `id_type_id` -> `id_types(id_type_id)`
  - `facial_verification_status_id` -> `facial_verification_statuses(status_id)`
  - `verification_status_id` -> `verification_statuses(verification_status_id)`
  - `reviewed_by` -> `users(user_id)` ON DELETE SET NULL
- **Indexes**: `idx_identity_verifications_user`, `idx_identity_verifications_status`
- **Core Rule**: Passing biometric facial verification sets `facial_verification_status_id = PASSED`, but leaves `verification_status_id = PENDING`. Only explicit administrator approval updates `verification_status_id = APPROVED` and `users.account_status_id = APPROVED`.

---

### 3.4 Domain 4: Items, Galleries & Saved Favorites

#### `item_locations`
- **Purpose**: Normalized geographic locations for items and community requests.
- **Primary Key**: `location_id` (BIGINT UNSIGNED)
- **Indexes**: `idx_item_locations_geo (municipality, barangay)`, `idx_item_locations_lat_lng (latitude, longitude)`

#### `items`
- **Purpose**: Community goods listed for donation, exchange, or request.
- **Primary Key**: `item_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `owner_id` -> `users(user_id)` ON DELETE CASCADE
  - `category_id` -> `item_categories(category_id)`
  - `condition_id` -> `item_conditions(condition_id)`
  - `item_type_id` -> `item_types(item_type_id)`
  - `item_status_id` -> `item_statuses(item_status_id)`
  - `location_id` -> `item_locations(location_id)`
- **Indexes**: `idx_items_owner`, `idx_items_category`, `idx_items_status`, `idx_items_type`, `idx_items_location`

#### `item_images`
- **Purpose**: Ordered multi-photo gallery for items (1:M). Eliminates repeating `image1`, `image2` columns.
- **Primary Key**: `item_image_id` (BIGINT UNSIGNED)
- **Foreign Keys**: `item_id` -> `items(item_id)` ON DELETE CASCADE

#### `item_pickup_options`
- **Purpose**: Normalized supported pickup/delivery options per item (`Meet up`, `Delivery`, `Pickup`).
- **Primary Key**: `pickup_option_id` (BIGINT UNSIGNED)
- **Unique Keys**: `(item_id, option_name)`

#### `saved_items`
- **Purpose**: M:N bookmark/favorite junction table between users and items.
- **Primary Key**: `(user_id, item_id)` (Composite PK prevents duplicate saves)

---

### 3.5 Domain 5: Community Requests

#### `item_requests` & `request_images`
- **Purpose**: Allows community neighbors to ask for urgent donations/goods during emergencies or school seasons.
- **Primary Key**: `request_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `user_id` -> `users(user_id)` ON DELETE CASCADE
  - `category_id` -> `item_categories(category_id)`
  - `urgency_id` -> `request_urgencies(urgency_id)`
  - `request_status_id` -> `request_statuses(request_status_id)`
  - `location_id` -> `item_locations(location_id)`

---

### 3.6 Domain 6: Exchanges & Ratings

#### `exchanges`
- **Purpose**: Central exchange coordination transaction.
- **Primary Key**: `exchange_id` (BIGINT UNSIGNED)
- **Foreign Keys**: `exchange_status_id` -> `exchange_statuses(exchange_status_id)`

#### `exchange_participants`
- **Purpose**: Normalized M:N junction table mapping all participating users to an exchange (`offerer`, `receiver`).
- **Primary Key**: `(exchange_id, user_id)`

#### `exchange_items`
- **Purpose**: M:N mapping of items included in the exchange and which participant contributed them (`offered`, `requested`).
- **Primary Key**: `exchange_item_id` (BIGINT UNSIGNED)
- **Unique Keys**: `(exchange_id, item_id)`

#### `ratings`
- **Purpose**: Peer reviews submitted by exchange participants.
- **Primary Key**: `rating_id` (BIGINT UNSIGNED)
- **Unique Keys**: `(exchange_id, rater_id, rated_user_id)` (Prevents duplicate reviews for the same exchange)
- **Check Constraint**: `CHECK (score BETWEEN 1 AND 5)`

---

### 3.7 Domain 7: Messaging & Conversations

#### `conversations`, `conversation_participants`, & `messages`
- **Purpose**: Real-time multi-party direct neighbor chat architecture.
- **Normalized Flow**:
  `users` <-> `conversation_participants` (M:N) <-> `conversations` (1:M) -> `messages`
- **Indexes**: `idx_messages_conversation_date (conversation_id, created_at)`

---

### 3.8 Domain 8: Notifications

#### `notifications`
- **Purpose**: User alert notifications with read receipts.
- **Primary Key**: `notification_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `user_id` -> `users(user_id)` ON DELETE CASCADE
  - `notification_type_id` -> `notification_types(notification_type_id)`
- **Indexes**: `idx_notifications_user_read (user_id, is_read, created_at)`

---

### 3.9 Domain 9: Reports & Administrative Audit Logs

#### `reports`
- **Purpose**: Community reporting system for offensive content, scam listings, or misconduct.
- **Primary Key**: `report_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `reporter_id` -> `users(user_id)` ON DELETE RESTRICT
  - `target_type_id` -> `report_target_types(target_type_id)`
  - `reason_id` -> `report_reasons(reason_id)`
  - `status_id` -> `report_statuses(report_status_id)`
  - `resolved_by` -> `users(user_id)` ON DELETE SET NULL

#### `audit_logs`
- **Purpose**: Immutable administrative action audit log.
- **Primary Key**: `audit_log_id` (BIGINT UNSIGNED)
- **Foreign Keys**:
  - `admin_id` -> `users(user_id)` ON DELETE RESTRICT
  - `action_id` -> `audit_actions(action_id)`
- **Indexes**: `idx_audit_logs_admin`, `idx_audit_logs_action`, `idx_audit_logs_entity (target_entity_type, target_entity_id)`
