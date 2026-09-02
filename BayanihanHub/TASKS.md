# TASK — Bayanihan Hub MVP Development

## 1. Frontend UI/UX Fix & Final Testing

* [ ] Fix and finalize the entire frontend UI/UX.
* [ ] Review **all existing pages and components** for layout, spacing, alignment, responsiveness, and consistency.
* [ ] Make sure all text, buttons, images, cards, forms, icons, and navigation elements are properly arranged.
* [ ] Ensure the UI follows the existing Bayanihan Hub design.
* [ ] Make the frontend responsive for desktop, tablet, and mobile.
* [ ] Check all existing frontend features and make sure they are still functional after the UI changes.
* [ ] Test all buttons, forms, navigation, modals, filters, uploads, and interactions.
* [ ] Fix any frontend errors, broken components, visual issues, or console errors.
* [ ] Do not remove existing functionality.
* [ ] Do not redesign the system's core workflow; focus on polishing and finalizing the existing MVP.

## 2. AI Chat Feature

Add an **AI Chat** feature to Bayanihan Hub.

### Purpose

The AI Chat should act as a **community-focused assistant** for the Bayanihan Hub system.

The AI should be able to:

* Answer questions about the Bayanihan Hub system.
* Provide information related to community assistance.
* Answer questions about donations, item exchanges, item requests, and community support.
* Provide system statistics when appropriate.

### System Statistics

The AI should be able to determine and provide information such as:

* Total number of posted items.
* Total number of reported items/posts.
* Total number of requested items.
* Total number of completed exchanges.
* Other relevant Bayanihan Hub statistics available from the database.

The AI should retrieve these values from the **actual system/database**, rather than using hardcoded numbers.

### Scope Restriction

The AI must remain focused on:

* Bayanihan Hub
* Community support
* Donations
* Item exchanges
* Item requests
* Community assistance
* System-related questions

Do **not** allow the AI to provide unrelated general-purpose answers outside the purpose of Bayanihan Hub.

## 3. Post Item — Live Location

Improve the existing **Post Item** feature by adding a live location option.

### Requirements

* [ ] Add a **"Use Current Location"** button.
* [ ] Add a clear **"Live Location"** label.
* [ ] Integrate Google Maps API for location functionality.
* [ ] Request the user's location permission when the feature is used.
* [ ] Retrieve the user's current latitude and longitude.
* [ ] Display the selected/current location on the map.
* [ ] Allow the location information to be associated with the posted item.
* [ ] Clearly show whether the location was successfully detected.
* [ ] Handle location permission denial and location errors gracefully.

Do not expose the Google Maps API key directly in frontend source code if the project architecture allows it. Use the appropriate environment variable configuration.

## 4. User Profile Picture & Admin Validation

Add a feature that allows users to upload their own profile picture.

### User Side

* [ ] Add a profile picture upload option in the user's Profile/Settings page.
* [ ] Allow users to select and upload an image.
* [ ] Show an image preview before submission.
* [ ] Validate the uploaded file type and size.
* [ ] Save the uploaded profile picture using the existing backend/storage architecture.
* [ ] Display the profile picture throughout the system where the user's avatar is shown.

### Admin Validation

Profile pictures uploaded by users must be subject to **admin validation**.

The system should provide an admin interface where administrators can:

* [ ] View pending profile picture submissions.
* [ ] Preview the uploaded image.
* [ ] Approve the profile picture.
* [ ] Reject the profile picture.
* [ ] Provide an optional rejection reason.
* [ ] Track the validation status.

Possible statuses:

* `Pending`
* `Approved`
* `Rejected`

Only an **approved profile picture** should become the user's official profile picture.

## General Requirements

* [ ] Preserve all existing functionality.
* [ ] Reuse the existing project architecture whenever possible.
* [ ] Do not unnecessarily rewrite the backend.
* [ ] Do not create fake/mock data for production functionality.
* [ ] Use the existing database and API structure where possible.
* [ ] Keep the implementation modular and maintainable.
* [ ] Follow the existing coding conventions.
* [ ] Add proper loading, success, and error states.
* [ ] Validate all user inputs.
* [ ] Make all new features responsive.
* [ ] Test the entire frontend after implementation.

## Goal

The goal is to have a **fully functional Bayanihan Hub** where:

1. The entire frontend UI/UX is clean, consistent, responsive, and finalized.
2. All existing frontend functionality works correctly.
3. Users can interact with an AI assistant focused specifically on Bayanihan Hub and community-related activities.
4. Users can attach their current location when posting an item.
5. Users can upload profile pictures.
6. Administrators can review and approve/reject profile pictures.
7. The entire frontend is tested end-to-end with no major UI or functionality issues.

## Note
    Wala pang backend kaya keep mo nalang yung mga sensitive info like API keys, secret keys, etc. tapos gamitin mo nalang yung mga mock data na nag exist diyan.wag mo e-replace yung mga existing na functions or features.
