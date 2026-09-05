-- ========================================================================
-- Bayanihan Hub — Reference & Static Seed Data
-- ========================================================================

-- 1. Account Statuses
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES
(1, 'PENDING', 'Pending Verification', 'Newly registered account awaiting administrator review'),
(2, 'APPROVED', 'Active & Approved', 'Account verified by administrator and permitted to authenticate'),
(3, 'REJECTED', 'Registration Rejected', 'Account application declined by administrator'),
(4, 'REQUIRES_REVIEW', 'Requires Additional Review', 'Application flagged for supplementary documentation or moderation')
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

-- 2. Roles
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'admin', 'System and barangay safety moderator with full verification privileges'),
(2, 'user', 'Standard verified community neighbor'),
(3, 'guest', 'Unverified visitor with browse-only capabilities')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 3. Profile Picture Statuses
INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES
(1, 'pending', 'Avatar photo uploaded and awaiting administrator moderation'),
(2, 'approved', 'Avatar approved and actively displayed across neighbor interactions'),
(3, 'rejected', 'Avatar rejected due to community guideline violations')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 4. Community Badges
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES
(1, 'trusted_donor', 'Trusted Donor', '🏅', 'Completed 10+ generous item donations to neighbors'),
(2, 'community_star', 'Community Star', '⭐', 'Maintained 4.5+ star average across all community ratings'),
(3, 'active_exchanger', 'Active Exchanger', '🔄', 'Successfully completed 10+ community exchanges'),
(4, 'top_contributor', 'Top Contributor', '🎖️', 'Ranked among top active neighbors in the municipality'),
(5, 'verified_neighbor', 'Verified Neighbor', '🛡️', 'Completed identity document check and administrator verification')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Official Philippine Government IDs
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES
(1, 'Philippine National ID / PhilSys ID', 'Philippine National ID (PhilSys)', 'PhilSys Card Number (PCN)', '1234-5678-9012-3456', '16-digit PhilSys Card Number printed on the card', FALSE, NULL, NULL, 'Permanent National ID for Filipino citizens with no expiration date.'),
(2, 'Driver\'s License', 'LTO Driver\'s License', 'License Number', 'N01-23-456789', 'Format: A00-00-000000', TRUE, NULL, NULL, 'Official Land Transportation Office (LTO) driver\'s license card.'),
(3, 'Philippine Passport', 'Philippine Passport (DFA)', 'Passport Number', 'P1234567A', 'Format: 1 Letter followed by 7-8 digits/characters', TRUE, NULL, NULL, 'Department of Foreign Affairs issued passport biodata page.'),
(4, 'UMID (Unified Multi-Purpose ID)', 'Unified Multi-Purpose ID (UMID)', 'Common Reference Number (CRN)', '0000-1234567-8', '12-digit CRN printed on the upper right of the card', FALSE, NULL, NULL, 'Issued by SSS/GSIS to government and private sector workers.'),
(5, 'Postal ID', 'PHLPost Postal ID', 'Postal Reference Number (PRN)', '123 456 789 012', '12-digit barcode or PRN number on card front', TRUE, NULL, NULL, 'Digitized Postal ID issued by the Philippine Postal Corporation.'),
(6, 'PRC ID (Professional Regulation Commission)', 'Professional Regulation Commission (PRC) ID', 'Registration Number', '0123456', '7-digit Professional License Number', TRUE, 'Profession / Specialization', 'e.g. Registered Nurse, Civil Engineer', 'Valid PRC identification card for licensed professionals.'),
(7, 'Senior Citizen ID', 'Senior Citizen ID (OSCA)', 'OSCA Control Number', 'SC-1234-5678', 'Control number issued by your Local Government OSCA', FALSE, 'Issuing LGU / Municipality', 'e.g. San Fernando, La Union', 'Office for Senior Citizens Affairs identification card.'),
(8, 'PWD ID', 'Persons with Disability (PWD) ID', 'Persons with Disability ID Number', 'PWD-01234-567', 'Issued by Municipal / City PDAO or MSWDO', FALSE, 'Issuing Municipality / City', 'e.g. Aringay, La Union', 'Official PWD identification card issued by the local PDAO.'),
(9, 'Voter\'s Certificate / Voter\'s ID', 'COMELEC Voter\'s ID / Certificate', 'Voter Identification Number (VIN)', '0123-4567A-B890CDE12345', 'COMELEC Voter Identification Number', FALSE, NULL, NULL, 'Issued by the Commission on Elections (COMELEC).'),
(10, 'SSS ID', 'Social Security System (SSS) ID', 'SSS Number', '01-2345678-9', '10-digit SSS member number format: XX-XXXXXXX-X', FALSE, NULL, NULL, 'Social Security System member identity card.'),
(11, 'GSIS eCard', 'GSIS eCard / UMID', 'GSIS Business Partner (BP) Number', '2000123456', '10-digit GSIS BP number', FALSE, NULL, NULL, 'Government Service Insurance System identity card for civil servants.'),
(12, 'TIN ID', 'Bureau of Internal Revenue (BIR) TIN Card', 'Tax Identification Number (TIN)', '123-456-789-000', '9 to 12 digit Tax Identification Number format', FALSE, NULL, NULL, 'Official BIR Tax Identification Number card.'),
(13, 'PhilHealth ID', 'PhilHealth Identification Card (PIC)', 'PhilHealth Identification Number (PIN)', '01-234567890-1', '12-digit PIN format: XX-XXXXXXXXX-X', FALSE, NULL, NULL, 'Philippine Health Insurance Corporation identity card.'),
(14, 'Pag-IBIG Loyalty Card', 'Pag-IBIG Loyalty Card Plus', 'Member ID (MID)', '1234-5678-9012', '12-digit Pag-IBIG Membership ID number', TRUE, NULL, NULL, 'Pag-IBIG Fund Loyalty Card Plus with banking chip.'),
(15, 'School ID', 'Accredited School / University ID', 'Student Identification Number', '2024-12345-LU', 'Official Student Registration Number', TRUE, 'School / University Name', 'e.g. Don Mariano Marcos Memorial State University', 'Currently enrolled student ID with valid academic year registration sticker.'),
(16, 'Other Government-Issued ID', 'Other Philippine Government-Issued ID', 'Document / Card ID Number', 'GOV-12345678', 'Official number printed on the government credential', TRUE, 'Issuing Agency or Barangay Office', 'e.g. Barangay San Antonio / Maritime Authority', 'Any recognized official Philippine national or local government photo credential.')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);

-- 6. Facial Verification Statuses
INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES
(1, 'NOT_STARTED', 'Facial selfie capture has not yet been performed'),
(2, 'PASSED', 'Biometric facial descriptors successfully matched document photo'),
(3, 'FAILED', 'Facial landmark discrepancies detected or quality below verification threshold')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 7. Verification Statuses
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES
(1, 'PENDING', 'Submitted and awaiting administrator review'),
(2, 'APPROVED', 'Reviewed and approved by authorized administrator'),
(3, 'REJECTED', 'Declined by administrator'),
(4, 'RETRY_REQUIRED', 'Returned to user for clearer photo or corrected document details')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 8. Item Categories
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES
(1, 'clothing', 'Clothing & Apparel', 'Shirt', 'Men\'s, women\'s, and children\'s apparel, uniforms, and shoes'),
(2, 'school-supplies', 'School & Office Supplies', 'BookOpen', 'Backpacks, uniforms, notebooks, stationery, and learning aids'),
(3, 'appliances', 'Home Appliances', 'Tv', 'Kitchen cookers, electric fans, irons, and small household devices'),
(4, 'books', 'Books & Learning Material', 'Book', 'Textbooks, children storybooks, reviewers, and novels'),
(5, 'toys', 'Toys & Games', 'Gamepad2', 'Children toys, puzzles, educational sets, and board games'),
(6, 'furniture', 'Furniture', 'Armchair', 'Chairs, study tables, shelves, and home furnishings'),
(7, 'food', 'Food & Pantry Essentials', 'Apple', 'Non-perishable canned goods, rice sacks, and community groceries'),
(8, 'electronics', 'Electronics & Gadgets', 'Smartphone', 'Phones, cables, radios, chargers, and small digital accessories'),
(9, 'tools', 'Tools & Hardware', 'Wrench', 'Carpentry, gardening, plumbing, and home repair tools'),
(10, 'other', 'Other Community Goods', 'Package', 'Miscellaneous helpful community items')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 9. Item Conditions
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES
(1, 'Brand New', 'Unused, unopened, in original packaging or with tags attached'),
(2, 'Like New', 'In near-perfect condition with no noticeable defects'),
(3, 'Good Condition', 'Shows minor normal wear but fully functional and clean'),
(4, 'Fair', 'Noticeable cosmetic wear but operational'),
(5, 'Poor', 'Heavy wear or needs slight maintenance to be useful')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 10. Item Types
INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES
(1, 'donation', 'Free surplus item given to fellow neighbors in need'),
(2, 'exchange', 'Item offered in exchange for another requested item'),
(3, 'request', 'Community request for an item needed by a neighbor')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 11. Item Statuses
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES
(1, 'available', 'Publicly discoverable and open for requests or exchange proposals'),
(2, 'reserved', 'Currently held for an accepted exchange or pending pickup'),
(3, 'exchanged', 'Successfully exchanged between community neighbors'),
(4, 'donated', 'Successfully received by neighbor as a free donation'),
(5, 'draft', 'Saved by owner but not yet published to the community'),
(6, 'reported', 'Flagged by community members and hidden pending moderator review'),
(7, 'removed', 'Withdrawn by owner or removed by administrator')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 12. Request Urgencies
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES
(1, 'low', 1),
(2, 'medium', 2),
(3, 'high', 3),
(4, 'critical', 4)
ON DUPLICATE KEY UPDATE `level` = VALUES(`level`);

-- 13. Request Statuses
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES
(1, 'active', 'Actively seeking assistance from the neighborhood'),
(2, 'in_progress', 'Neighbor has stepped forward to fulfill the request'),
(3, 'completed', 'Request successfully fulfilled and closed'),
(4, 'cancelled', 'Closed by requester or expired')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 14. Exchange Statuses
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES
(1, 'pending', 'Proposal submitted to owner, awaiting decision'),
(2, 'accepted', 'Accepted by recipient, awaiting meeting coordination'),
(3, 'meeting_scheduled', 'Meeting date and community location agreed upon'),
(4, 'completed', 'Physical handover verified and completed by both parties'),
(5, 'cancelled', 'Cancelled by one of the participants before handover'),
(6, 'rejected', 'Proposal declined by owner')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 15. Message Types
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES
(1, 'text'),
(2, 'image'),
(3, 'file'),
(4, 'system')
ON DUPLICATE KEY UPDATE `type_name` = VALUES(`type_name`);

-- 16. Notification Types
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES
(1, 'new_message', 'New Message', 'Direct chat message from a neighbor'),
(2, 'exchange_request', 'Exchange Proposal', 'Neighbor offered an item to exchange'),
(3, 'exchange_accepted', 'Exchange Accepted', 'Your exchange proposal was accepted'),
(4, 'exchange_rejected', 'Exchange Declined', 'Your exchange proposal was declined'),
(5, 'exchange_completed', 'Exchange Completed', 'Exchange transaction marked completed'),
(6, 'item_favorited', 'Item Saved', 'A neighbor saved your item listing'),
(7, 'request_response', 'Request Response', 'A neighbor offered help for your community request'),
(8, 'new_nearby_item', 'New Nearby Item', 'New item donation posted in your barangay'),
(9, 'admin_announcement', 'Community Announcement', 'Important notice from barangay safety administration'),
(10, 'profile_picture_approved', 'Profile Picture Approved', 'Your submitted avatar was approved by moderators'),
(11, 'profile_picture_rejected', 'Profile Picture Rejected', 'Your avatar did not meet guidelines'),
(12, 'identity_verification_approved', 'Identity Verified & Account Approved', 'Your account has been approved by administrator'),
(13, 'identity_verification_rejected', 'Registration Rejected', 'Your identity documents were not approved'),
(14, 'system', 'System Notice', 'General platform system update')
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

-- 17. Report Reasons
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES
(1, 'inappropriate', 'Inappropriate or offensive content'),
(2, 'spam', 'Commercial advertisement, repetitive spam, or duplicate listing'),
(3, 'scam', 'Fraudulent, counterfeit, or misleading information'),
(4, 'offensive', 'Harassment, hate speech, or disrespectful behavior'),
(5, 'duplicate', 'Duplicate posting of an existing item'),
(6, 'other', 'Other community guideline violations')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 18. Report Statuses
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES
(1, 'pending', 'Submitted and awaiting moderator investigation'),
(2, 'reviewed', 'Under active review by administrator'),
(3, 'resolved', 'Appropriate disciplinary or cleanup action taken'),
(4, 'dismissed', 'Investigated and determined not to violate guidelines')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 19. Report Target Types
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES
(1, 'user'),
(2, 'item'),
(3, 'message')
ON DUPLICATE KEY UPDATE `type_name` = VALUES(`type_name`);

-- 20. Administrative Audit Actions
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES
(1, 'USER_APPROVED', 'Administrator approved a pending registration and activated account'),
(2, 'USER_REJECTED', 'Administrator rejected an identity registration'),
(3, 'VERIFICATION_REVIEWED', 'Administrator reviewed biometric identity credentials'),
(4, 'PROFILE_PICTURE_APPROVED', 'Administrator approved an applicant avatar photo'),
(5, 'PROFILE_PICTURE_REJECTED', 'Administrator rejected an applicant avatar photo'),
(6, 'ITEM_REMOVED', 'Administrator removed an item listing violating policy'),
(7, 'USER_SUSPENDED', 'Administrator suspended an account for misconduct'),
(8, 'REPORT_RESOLVED', 'Administrator resolved a community safety report')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
