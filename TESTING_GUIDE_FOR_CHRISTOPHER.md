# BayanihanHub — Quality Assurance & Testing Guide for Christopher

**Target System:** BayanihanHub (Community Barter, Exchange & Donation Platform)  
**Assigned QA Tester:** Christopher  
**Live Frontend (Vercel):** [https://bayanihanhub-beta.vercel.app](https://bayanihanhub-beta.vercel.app)  
**Live Backend API (Render):** [https://bayanihanhub-api.onrender.com](https://bayanihanhub-api.onrender.com)  
**Cloud Database:** TiDB Cloud Serverless (`bayanihan_hub`)  

---

## 📌 Testing Types Summary Table

| Testing Type | Simple Meaning | Key Focus in BayanihanHub |
| :--- | :--- | :--- |
| **1. Smoke Testing** | Quick check that the major features work before deeper testing | Verify home page, login, navigation, and item grid render without crash. |
| **2. Sanity Testing** | Quick check that a specific fix/change works correctly | Validate recent fixes (e.g., landing page redirection, database cloud connectivity). |
| **3. Regression Testing** | Checks that new changes didn't break existing features | Ensure authentication, search, and item listing remain functional after deployments. |
| **4. Retesting** | Tests a previously failed feature again after it was fixed | Retest previously broken APIs (e.g., `/api/db-health` and image uploads). |
| **5. Functional Testing** | Checks whether features work according to requirements | Verify item creation, filtering by category, search queries, and chat messages. |
| **6. Integration Testing** | Checks whether different modules work together | Verify Frontend (Vercel) interacts smoothly with Backend (Render) and MySQL (TiDB). |
| **7. System Testing** | Tests the entire application as one complete system | Execute full suite of user actions across all modules simultaneously. |
| **8. Acceptance Testing (UAT)** | Checks whether the system meets user/business requirements | Verify if the app fulfills community donation, barter, and admin moderation workflows. |
| **9. Exploratory Testing** | Tester explores the system freely to find unexpected bugs | Navigate non-linearly, enter unexpected inputs, rapid clicks, edge navigation. |
| **10. Ad-hoc Testing** | Informal testing without a predefined test plan | Random clicks, browser back/forward, rapid refreshing during active sessions. |
| **11. End-to-End (E2E) Testing** | Tests a complete user workflow from beginning to end | Full lifecycle: Register User ➔ Post Donation Item ➔ Request Item ➔ Chat ➔ Complete. |
| **12. Performance Testing** | Checks speed, stability, and responsiveness | Page load times, API response latency, and rendering smoothness. |
| **13. Load Testing** | Checks how the system performs under expected traffic | Simultaneous browsing, pagination, and multi-user item queries. |
| **14. Stress Testing** | Pushes the system beyond normal limits | Large image uploads, rapid spamming of request buttons, oversized text payloads. |
| **15. Security Testing** | Looks for security vulnerabilities | JWT authentication guardrails, SQL injection, XSS inputs, admin route protection. |
| **16. Compatibility Testing** | Tests browsers, devices, OS, etc. | Chrome, Edge, Safari, Firefox, Android Mobile, iOS Mobile, Tablet viewports. |
| **17. Usability Testing** | Checks how easy the system is to use | Readability, intuitive UI buttons, clear error prompts, smooth onboarding. |

---

## 📋 Detailed Testing Checklist & Step-by-Step Instructions

---

### 1. Smoke Testing
> **Simple Meaning:** Quick check that the major features work before deeper testing.
* **Objective:** Ensure the live deployment is healthy and not blocked by fatal errors.
* **Test Steps:**
  1. Open [https://bayanihanhub-beta.vercel.app](https://bayanihanhub-beta.vercel.app).
  2. Confirm Landing / Home page loads with clean graphics, cards, and header.
  3. Click "Explore Items" or browse the community items section.
  4. Click "Login" / "Register" button and check modal/page appears.
* **Expected Result:** App loads within 3 seconds, zero blank screens, zero fatal console errors.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 2. Sanity Testing
> **Simple Meaning:** Quick check that a specific fix/change works correctly.
* **Objective:** Verify the latest cloud database migration and API routing fix.
* **Test Steps:**
  1. Check endpoint in browser: [https://bayanihanhub-beta.vercel.app/api/db-health](https://bayanihanhub-beta.vercel.app/api/db-health).
  2. Confirm response shows `"status": "connected"`.
  3. Verify landing page redirection logic: authenticated users go to `/dashboard`, guests stay on landing.
* **Expected Result:** Health check returns `connected` and landing redirects appropriately.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 3. Regression Testing
> **Simple Meaning:** Checks that new changes didn't break existing features.
* **Objective:** Confirm past features still function normally after the recent deployment.
* **Test Steps:**
  1. Test Search bar with keywords (e.g., "Calculator", "Book", "Chair").
  2. Test Category filter dropdown (e.g., Electronics, School Supplies, Furniture).
  3. View an existing item detail card.
  4. Check User Profile page.
* **Expected Result:** Items filter accurately in real-time without breaking layout.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 4. Retesting
> **Simple Meaning:** Tests a previously failed feature again after it was fixed.
* **Objective:** Verify previous database `503 Service Unavailable` or `Name or service not known` errors are resolved.
* **Test Steps:**
  1. Open the items feed.
  2. Open Developer Tools (F12) ➔ Network Tab.
  3. Filter by `Fetch/XHR` and inspect `GET /api/items`.
  4. Ensure HTTP status code is `200 OK` (not `500` or `503`).
* **Expected Result:** Database queries execute smoothly and return 11+ live community items.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 5. Functional Testing
> **Simple Meaning:** Checks whether features work according to requirements.
* **Objective:** Validate core business rules and user operations.
* **Test Steps:**
  1. **User Registration:** Register a new user with email, name, password, and contact.
  2. **User Login:** Log in with created credentials; verify JWT token is stored.
  3. **Post Item:** Click "Post Item" / "Donate", upload item image, fill title, category, description, and submit.
  4. **Item Display:** Confirm the newly created item appears on the feed immediately.
  5. **Status Update:** Test editing or marking an item as available / pending.
* **Expected Result:** All CRUD operations succeed with proper validation feedback.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 6. Integration Testing
> **Simple Meaning:** Checks whether different modules work together.
* **Objective:** Ensure seamless data exchange across Frontend, Backend, and Database tiers.
* **Test Steps:**
  1. Frontend submits a message / item request.
  2. FastAPI backend processes authentication token and writes to TiDB Cloud tables (`conversations`, `items`, `requests`).
  3. Receiver's notification badge / inbox updates with the new message count.
* **Expected Result:** Data created on the frontend persists accurately in the database and updates dependent components.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 7. System Testing
> **Simple Meaning:** Tests the entire application as one complete system.
* **Objective:** Validate end-to-end functionality of the platform as a cohesive unit.
* **Test Steps:**
  1. Run user through all available tabs: Home, Feed, Notifications, Messages, Profile, Admin Panel (if authorized).
  2. Check data consistency (e.g., user name and badges match across feed, chat, and profile).
* **Expected Result:** No inconsistencies or broken links across disparate pages.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 8. Acceptance Testing (UAT)
> **Simple Meaning:** Checks whether the system meets user/business requirements.
* **Objective:** Determine if the system is ready for general community release.
* **Test Steps:**
  1. Evaluate user journey from the perspective of a college student / resident donating goods.
  2. Evaluate recipient journey requesting a community donation item.
  3. Verify community safety notice and guidelines modal appear as expected.
* **Expected Result:** User flow aligns with Bayanihan spirit: straightforward, accessible, helpful.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 9. Exploratory Testing
> **Simple Meaning:** Tester explores the system freely to find unexpected bugs.
* **Objective:** Discover unexpected defects outside predefined test scripts.
* **Test Steps:**
  1. Freely click through unusual combinations of filters and sort orders.
  2. Try entering special characters (e.g., emojis, `<script>`, long foreign characters) in search and bio fields.
  3. Open multiple tabs with different item pages at the same time.
* **Expected Result:** App handles unconventional user actions gracefully without crashing or throwing unhandled exceptions.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 10. Ad-hoc Testing
> **Simple Meaning:** Informal testing without a predefined test plan.
* **Objective:** Spontaneous trial-and-error tests.
* **Test Steps:**
  1. Rapidly spam the browser "Back" and "Forward" buttons during page transitions.
  2. Turn off Wi-Fi/Internet momentarily while clicking an action, then turn it back on.
  3. Refresh the page mid-submission of a form.
* **Expected Result:** Clear error prompts or recovery states without corrupted application state.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 11. End-to-End (E2E) Testing
> **Simple Meaning:** Tests a complete user workflow from beginning to end.
* **Objective:** Verify a complete multi-user interaction cycle.
* **Test Steps:**
  1. **User A (Donor):** Log in and post a new donation item (e.g., "College Calculus Textbook").
  2. **User B (Recipient):** Open an incognito browser window, log in as a second user, search for the item, and click "Request Item".
  3. **Messaging:** User B sends a message: "Hi! Is this still available for campus pickup?".
  4. **User A Notification:** User A receives notification and opens message inbox.
  5. **Accept & Complete:** User A accepts the request; item status transitions to "Completed / Given".
* **Expected Result:** Full lifecycle completes with all statuses reflected for both users.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 12. Performance Testing
> **Simple Meaning:** Checks speed, stability, and responsiveness.
* **Objective:** Ensure rapid UI rendering and low API latency.
* **Test Steps:**
  1. Open Chrome DevTools ➔ Lighthouse Tab ➔ Run "Performance" audit.
  2. Measure initial First Contentful Paint (FCP) and Largest Contentful Paint (LCP).
  3. Check API response times in Network Tab (target: < 500ms for warm requests).
* **Expected Result:** Smooth animations, no UI freeze, fast card loading.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 13. Load Testing
> **Simple Meaning:** Checks how the system performs under expected traffic.
* **Objective:** Verify multi-user query capability.
* **Test Steps:**
  1. Open 5 browser tabs simultaneously making requests to the feed and search.
  2. Rapidly cycle through search filters.
* **Expected Result:** TiDB Cloud connection pool maintains connectivity with 0 connection timeouts.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 14. Stress Testing
> **Simple Meaning:** Pushes the system beyond normal limits.
* **Objective:** Test edge boundary behavior and resilience.
* **Test Steps:**
  1. Attempt uploading an oversized image file (> 10MB).
  2. Attempt uploading an invalid file extension (e.g., `.exe` or `.bat`) as an image.
  3. Paste a 5,000-character description into item creation.
* **Expected Result:** Clear error notification: "File exceeds maximum size limit (5MB)" or "Unsupported format". No server crash.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 15. Security Testing
> **Simple Meaning:** Looks for security vulnerabilities.
* **Objective:** Safeguard user data, routes, and authentication.
* **Test Steps:**
  1. Attempt to navigate directly to `/admin` or admin endpoints without an admin token.
  2. Attempt SQL injection in search bar: `' OR 1=1 --`.
  3. Attempt Cross-Site Scripting (XSS) in item title: `<script>alert('hack')</script>`.
  4. Inspect token expiration and logout invalidation.
* **Expected Result:** Unauthorized users redirected to 403/Login; input sanitization escapes malicious code.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 16. Compatibility Testing
> **Simple Meaning:** Tests browsers, devices, OS, etc.
* **Objective:** Ensure visual and interactive fidelity across diverse platforms.
* **Test Matrix:**
  * [ ] **Google Chrome (Desktop)**
  * [ ] **Microsoft Edge (Desktop)**
  * [ ] **Mozilla Firefox (Desktop)**
  * [ ] **Mobile Viewport (Responsive 375px - 414px / iPhone)**
  * [ ] **Tablet Viewport (iPad 768px - 1024px)**
* **Expected Result:** Layout automatically adapts (hamburger menu, responsive grid, tap-friendly touch targets).
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

### 17. Usability Testing
> **Simple Meaning:** Checks how easy the system is to use.
* **Objective:** Verify user-friendly design and ergonomics.
* **Test Steps:**
  1. Can a first-time user locate the "Post Item" button within 5 seconds?
  2. Are font sizes, colors, and button contrast easy to read?
  3. Are validation errors informative (e.g., "Password must be at least 8 characters") rather than generic?
* **Expected Result:** Intuitive user experience, clear buttons, helpful feedback toasts.
* [ ] **Status:** `[ PASS / FAIL ]` | **Notes:** ___________________________________

---

## 🐞 Bug / Issue Reporting Template

When Christopher finds an issue, report it using this standardized format:

```markdown
### Bug Report #[Number]
* **Title:** [Short description of the bug]
* **Testing Type:** [e.g., Functional, Security, Usability]
* **Severity:** [Critical / High / Medium / Low]
* **Environment:** [e.g., Chrome Windows, Safari iOS, etc.]
* **Steps to Reproduce:**
  1. Go to '...'
  2. Click on '...'
  3. Enter '...'
* **Expected Behavior:** [What should happen]
* **Actual Behavior:** [What actually happened]
* **Screenshot / Console Error:** [Attach image or copy error log]
```

---

## ✍️ QA Sign-Off

* **Tester Name:** Christopher  
* **Date Completed:** ____________________  
* **Overall Assessment:** `[ READY FOR RELEASE / NEEDS FIXES / BLOCKED ]`  
* **Signature:** ____________________  
