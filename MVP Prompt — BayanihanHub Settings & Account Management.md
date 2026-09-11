# MVP PROMPT — BAYANIHANHUB SETTINGS & ACCOUNT MANAGEMENT

## Objective

Improve the existing **BayanihanHub Settings page** into a complete, modern, production-ready settings and account management system.

Before making changes:

- Inspect the existing frontend, backend/API, database schema, authentication, user profile, notification, messaging, and location systems.
- **Reuse the existing architecture and components whenever possible.**
- Do not create duplicate systems.
- Do not remove existing functionality.
- Do not break existing authentication, messaging, requests, posts, notifications, or admin functionality.
- If a setting already exists somewhere else in the system, connect it to Settings instead of creating another implementation.
- All settings that affect security, privacy, notifications, or account behavior must be **persisted in the database** and actually enforced by the application.

---

# 1. Settings Page Structure

Organize Settings into clear sections/cards:

1. **Profile & Location**
2. **Community Discovery**
3. **Notifications**
4. **Privacy & Neighbor Trust**
5. **Messaging & Activity**
6. **Account & Security**
7. **Appearance & Accessibility**
8. **Data & Privacy**
9. **Danger Zone**

Use a clean card-based layout with sufficient spacing, readable labels, descriptions, icons, toggles, dropdowns, and confirmation dialogs.

Make the page fully responsive for:

- Desktop
- Tablet
- Mobile

Do not allow text, buttons, toggles, or cards to touch borders or overflow the screen.

---

# 2. Profile & Location

Improve the existing profile/location settings.

### Address

Use the complete Philippine address structure:

```text
Barangay
Municipality / City
Province
```

If the database already has location tables, reuse them.

Do not store unnecessary duplicated location strings if normalized relationships already exist.

### Location Validation

When possible:

- Validate required location fields.
- Use appropriate Philippine municipality/province relationships.
- Prevent invalid combinations.

### Default Location

Allow the user to choose their default community location.

Example:

```text
Default Location
[ Barangay ______ ▼ ]

Municipality / City
[ ______ ▼ ]

Province
[ ______ ▼ ]
```

---

# 3. Community Discovery Preferences

Because BayanihanHub is a hyper-local community platform, allow users to control how far they discover community posts.

### Discovery Radius

Provide:

```text
Within my Barangay
Within 5 km
Within 10 km
Within my Municipality
Whole Municipality
```

Store the selected preference.

Use this preference when determining relevant:

- Donation items
- Community requests
- Exchange opportunities
- Urgent community aid

Do not modify the existing recommendation/business logic unnecessarily. Integrate the setting into the existing discovery/filter system.

---

# 4. Location Privacy

Add:

### Approximate Location

Toggle:

```text
Show approximate location only
[ ON / OFF ]
```

When enabled, public listings should avoid exposing precise locations.

Example:

Instead of:

```text
123 Example Street, Barangay X
```

show:

```text
Barangay X, Municipality Y
```

Never expose a user's exact address publicly unless the existing business rules explicitly require it.

The privacy preference must be enforced server-side, not only hidden through the frontend.

---

# 5. Notification Preferences

Create a dedicated notification-preferences section.

Allow users to individually control notifications.

### In-App Notifications

```text
Messages
[ ON ]

Replies
[ ON ]

Message Reactions
[ ON ]

Donation Requests
[ ON ]

Exchange Offers
[ ON ]

Request Status Updates
[ ON ]

Ratings & Reviews
[ ON ]

Reports / Moderation Updates
[ ON ]

Account Updates
[ ON ]
```

### Email Notifications

Allow separate controls:

```text
Message notifications
Donation/request updates
Exchange updates
Account/security alerts
```

Security-critical notifications should not be disabled if they are required by the system.

### Urgent Community Aid

Add:

```text
Urgent Community Aid Alerts
[ ON ]
```

When enabled, notify the user about relevant urgent requests within their configured discovery area.

Avoid notification spam by respecting the user's preference and existing notification architecture.

---

# 6. Notification Frequency

Add optional notification frequency controls:

```text
Real-time
Daily summary
Important notifications only
```

If the existing notification architecture does not support scheduled summaries, implement the setting in a way that does not break the current notification system.

Do not create unnecessary background jobs if they are not required.

---

# 7. Privacy & Neighbor Trust

Create a privacy section focused on safe community interactions.

### Phone Number Visibility

Allow:

```text
Hidden
Verified neighbors only
Accepted exchange/request partners only
```

Recommended default:

```text
Accepted exchange/request partners only
```

The backend must enforce this visibility rule.

Do not simply hide the number using CSS/frontend logic.

---

# 8. Online & Activity Status

Add:

```text
Show Active Now / Last Active
[ ON / OFF ]
```

When disabled:

- Do not show "Active Now".
- Do not show "Active X minutes ago".
- Do not expose the user's last-seen information to other users.

This must integrate with the existing messaging presence system.

Preserve the current behavior where appropriate:

```text
Active Now
Active 5 mins ago
Active 29 mins ago
Offline
```

Do not show everyone as permanently active.

---

# 9. Read Receipts

Add:

```text
Show Read Receipts
[ ON / OFF ]
```

When disabled, other users should not receive the user's read/seen status if the messaging architecture supports this privacy option.

Do not break existing message delivery.

---

# 10. Identity Verification Status

Add an **Identity Verification** card.

Display:

```text
Identity Verification

Status:
✓ Verified
```

or:

```text
Status:
Pending Review
```

or:

```text
Status:
Not Verified
```

Use the existing identity-verification system.

If the user has not completed verification:

```text
[ Start Verification ]
```

If verification is pending:

```text
Your verification is currently being reviewed.
```

Do not allow users to bypass the existing admin approval process.

Facial verification passing must not automatically mean the account is approved.

---

# 11. Account & Security

Create a dedicated security section.

### Email

Display:

```text
Email Address
example@email.com
✓ Verified
```

Allow:

```text
[ Change Email ]
```

Changing an email should require appropriate verification.

Do not immediately replace a verified email without completing the required verification process.

---

# 12. Change Password

Provide:

```text
Current Password
New Password
Confirm New Password
```

Requirements:

- Validate current password.
- Validate password strength.
- Confirm new password matches.
- Show clear validation errors.
- Do not expose passwords in logs.
- Do not store plaintext passwords.

After a successful password change, optionally provide:

```text
Log out other active sessions?
[ Cancel ] [ Log Out Other Sessions ]
```

---

# 13. Active Sessions

Add an **Active Sessions** section.

Display information such as:

```text
Current Device
Windows • Chrome
Last active: Now

Other Device
Android • Chrome
Last active: 2 hours ago
```

Provide:

```text
[ Log Out ]
```

for individual sessions and:

```text
[ Log Out All Other Sessions ]
```

Do not expose sensitive technical information such as authentication tokens.

---

# 14. Two-Factor Authentication

If the current authentication architecture can support it, add:

```text
Two-Factor Authentication
[ Enable ]
```

Support a secure second-factor method appropriate for the existing system.

If 2FA cannot safely be implemented within the current MVP architecture, create the UI as a **future-ready disabled/coming-soon feature** rather than implementing insecure fake 2FA.

Never create a fake security feature.

---

# 15. Login & Security Alerts

Add:

```text
New Login Alerts
[ ON ]
```

Notify users when a new device/session logs into their account.

Include useful information such as:

```text
New login detected
Device: Chrome on Windows
Time: September 10, 2026
```

Do not expose unnecessary sensitive information.

---

# 16. Messaging Preferences

Create a dedicated messaging-preferences subsection.

Allow:

```text
Allow messages from verified neighbors
[ ON ]

Allow messages from users with active requests/exchanges
[ ON ]

Message sound
[ ON ]

Typing indicator
[ ON ]

Read receipts
[ ON ]
```

The exact options should respect the existing messaging rules.

Do not allow privacy settings to bypass required moderation or administrative communication.

---

# 17. Appearance

Add lightweight appearance controls.

### Theme

```text
System Default
Light
Dark
```

If BayanihanHub already has a theme system, reuse it.

### Compact Mode

Optional:

```text
Compact Layout
[ OFF ]
```

When enabled, slightly reduce spacing in:

- Lists
- Tables
- Cards
- Notifications
- Messages

Do not make the interface cramped.

---

# 18. Accessibility

Add practical accessibility preferences.

### Reduced Motion

```text
Reduce animations
[ OFF ]
```

When enabled:

- Reduce unnecessary transitions.
- Disable excessive animations.
- Preserve functionality.

### Larger Text

Optional:

```text
Text Size
Small
Default
Large
```

Ensure the setting does not break responsive layouts.

---

# 19. Language

Prepare the system for future localization.

Add:

```text
Language
[ English ▼ ]
```

If Filipino is already supported, allow:

```text
English
Filipino
```

If localization is not currently implemented, do not create fake translations. Make the UI future-ready.

---

# 20. Data & Privacy

Create a **Data & Privacy** section.

### Download My Data

Provide:

```text
[ Request My Data ]
```

Allow users to request a copy of their account-related data where supported.

The implementation should respect the Philippine **Data Privacy Act of 2012** and the platform's actual data-retention requirements.

Do not expose passwords, authentication tokens, or other security secrets.

### Privacy Information

Provide a link/button:

```text
[ Privacy Policy ]
```

and optionally:

```text
[ Community Guidelines ]
```

Use the existing legal/document system if available.

---

# 21. Blocked Users

Add:

```text
Blocked Users
[ Manage ]
```

Allow users to:

- View blocked users.
- Unblock users.
- Confirm before unblocking.

Integrate with the existing messaging and community interaction system.

If blocking does not currently exist, implement it consistently across:

- Messaging
- Posts
- Requests
- User profiles

Avoid creating a separate blocking system for each feature.

---

# 22. Saved & Personal Preferences

Optional useful settings:

```text
Default Browse Category
[ All Categories ]

Default Feed
[ Nearby ]

Show completed listings
[ OFF ]

Show unavailable items
[ OFF ]
```

Use these only if they fit the existing Browse/Home architecture.

---

# 23. Account Deactivation

Create a **Danger Zone** at the bottom.

### Temporarily Deactivate

Button:

```text
[ Temporarily Deactivate Account ]
```

Explain:

> Your account will be temporarily inactive. Your data will be retained, but your public activity may be hidden according to platform rules.

Require confirmation.

The backend must prevent the deactivated user from performing normal authenticated actions.

Do not delete their data.

---

# 24. Delete Account

Provide:

```text
[ Delete Account ]
```

Use a strong confirmation modal.

Example:

```text
Delete Account?

This action may permanently remove your account and associated data according to BayanihanHub's retention policy.

Type DELETE to confirm:

[____________]

[ Cancel ] [ Delete Account ]
```

Never delete an account accidentally through a single click.

Consider a grace period if supported by the existing architecture.

---

# 25. Save Behavior

For settings that can be changed immediately:

```text
Toggle → Save automatically
```

For grouped settings:

```text
[ Save Changes ]
[ Cancel ]
```

Do not mix save behavior unpredictably.

Show clear feedback:

```text
✓ Settings saved successfully
```

or:

```text
⚠ Unable to save settings. Please try again.
```

Do not show a success message when the backend update actually failed.

---

# 26. Backend & Database

Before creating new tables, inspect the existing database.

Reuse existing tables where appropriate.

If new tables are necessary, maintain the BayanihanHub database requirement:

- **MySQL**
- **3NF**
- InnoDB
- UTF-8 / `utf8mb4`
- Proper primary keys
- Proper foreign keys
- Appropriate indexes
- No unnecessary duplicated data
- No relational data hidden inside JSON
- Safe migrations
- Existing data must remain intact

Possible entities:

```text
User_Settings
User_Notification_Preferences
User_Privacy_Preferences
User_Discovery_Preferences
User_Sessions
```

Do not automatically create all of these if existing tables already provide the required functionality.

---

# 27. API Requirements

Create or update APIs only where necessary.

Settings APIs should:

- Authenticate the current user.
- Authorize access to their own settings.
- Validate input.
- Persist changes.
- Return accurate success/error responses.
- Never expose another user's private settings.
- Enforce privacy settings server-side.

Example architecture:

```text
GET    /api/settings
PUT    /api/settings/profile
PUT    /api/settings/discovery
PUT    /api/settings/notifications
PUT    /api/settings/privacy
PUT    /api/settings/security
POST   /api/settings/deactivate
POST   /api/settings/delete
```

Adapt the routes to the project's existing API conventions rather than blindly creating these exact endpoints.

---

# 28. Security Requirements

Settings must not become a security vulnerability.

Ensure:

- Authentication is required.
- Users can only modify their own settings.
- Sensitive changes require re-authentication where appropriate.
- Passwords are never returned by APIs.
- Tokens are never returned in settings responses.
- Email changes require verification.
- Account deletion requires confirmation.
- Privacy settings are enforced server-side.
- Suspended/deactivated users cannot bypass restrictions through APIs.

---

# 29. UI/UX Requirements

Make Settings feel like a real production application.

Use:

- Clear section headings
- Short descriptions
- Consistent icons
- Toggle switches
- Select/dropdown controls
- Confirmation dialogs
- Toast notifications
- Proper spacing
- Responsive cards
- Consistent button hierarchy

Example:

```text
Privacy & Neighbor Trust
────────────────────────────────

Phone Number Visibility
Control who can see your phone number.

[ Accepted exchange/request partners only ▼ ]


Online & Activity Status
Allow other users to see when you're active.

                              [ ON ]


Read Receipts
Allow users to know when you've viewed their messages.

                              [ ON ]
```

Do not overload users with too many settings on one screen.

Group related settings logically.

---

# 30. Admin Compatibility

Settings must respect existing Admin controls.

For example:

- Admin suspension overrides normal user activity.
- Admin verification status remains authoritative.
- Removed posts remain removed.
- Moderation restrictions cannot be bypassed through user settings.
- Account status remains controlled by the existing approval/suspension system.

Do not allow users to modify administrative fields through Settings.

---

# 31. Audit Logging

For security-sensitive actions, use the existing audit-log system.

Potential events:

```text
EMAIL_CHANGED
PASSWORD_CHANGED
PRIVACY_SETTINGS_CHANGED
ACCOUNT_DEACTIVATED
ACCOUNT_DELETION_REQUESTED
SESSION_REVOKED
```

Do not log sensitive values such as passwords, tokens, or private credentials.

---

# 32. Implementation Priority

Implement in this order:

### Phase 1 — High Priority

1. Profile & complete location
2. Community discovery radius
3. Notification preferences
4. Phone-number visibility
5. Online/activity status
6. Identity verification status
7. Confirm password
8. Account deactivation/deletion

### Phase 2 — Security & Privacy

9. Active sessions
10. Login alerts
11. Read receipts
12. Messaging preferences
13. Blocked users
14. Data/privacy controls

### Phase 3 — Quality of Life

15. Theme
16. Reduced motion
17. Text-size preferences
18. Language readiness
19. Feed/browse preferences

### Phase 4 — Future-Ready

20. 2FA
21. Data export automation
22. Advanced notification digest
23. More granular community discovery controls

---

# 33. Important MVP Rules

**DO NOT:**

- Rewrite the entire BayanihanHub architecture.
- Replace the existing authentication system.
- Create duplicate user/profile systems.
- Create duplicate notification systems.
- Break existing messaging.
- Break existing location functionality.
- Store sensitive information unnecessarily.
- Implement fake security features.
- Make frontend-only privacy restrictions.
- Remove existing settings without a migration plan.

**DO:**

- Inspect the existing code first.
- Reuse existing APIs/components/database structures.
- Make the smallest safe changes necessary.
- Keep the system backward compatible.
- Validate everything on the backend.
- Make settings actually affect the relevant features.
- Keep the UI clean and consistent with the existing BayanihanHub design.
- Make all settings responsive.
- Handle loading, success, empty, and error states.
- Preserve existing functionality.

---

# Final Goal

Transform the current BayanihanHub Settings page from a basic configuration screen into a **complete user control center**.

The user should be able to manage:

**Profile → Location → Community Discovery → Notifications → Privacy → Messaging → Security → Appearance → Data → Account**

while BayanihanHub continues using its existing authentication, database, messaging, notification, identity-verification, and admin systems.

**Core principle:**

> Settings should not just change what the user sees. Every setting that controls behavior, privacy, security, or notifications must actually be persisted and enforced throughout BayanihanHub.