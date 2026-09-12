-- BayanihanHub Clean Production Schema & Seed Data
-- Target: Cloud MySQL (Aiven, Render, PlanetScale, Railway)
-- Preserves: Admin (user 5), Jehosue (user 14), Student 1 (user 19), Student 2 (user 20), and 4 clean users
-- Preserves: Exactly 10 items owned by Jehosue

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `account_statuses`;
CREATE TABLE "account_statuses" (
  "account_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_code" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "display_name" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("account_status_id"),
  UNIQUE KEY "uq_account_statuses_code" ("status_code")
);

INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (1, 'PENDING', 'Pending Verification', 'Newly registered account awaiting administrator review');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (2, 'APPROVED', 'Active & Approved', 'Account verified by administrator and permitted to authenticate');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (3, 'REJECTED', 'Registration Rejected', 'Account application declined by administrator');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (4, 'REQUIRES_REVIEW', 'Requires Additional Review', 'Application flagged for supplementary documentation or moderation');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (5, 'SUSPENDED', 'Account Suspended', 'Account temporarily or permanently suspended by administrator');

DROP TABLE IF EXISTS `audit_actions`;
CREATE TABLE "audit_actions" (
  "action_id" smallint unsigned NOT NULL AUTO_INCREMENT,
  "action_name" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("action_id"),
  UNIQUE KEY "uq_audit_actions_name" ("action_name")
);

INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (1, 'USER_APPROVED', 'Administrator approved a pending registration and activated account');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (2, 'USER_REJECTED', 'Administrator rejected an identity registration');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (3, 'VERIFICATION_REVIEWED', 'Administrator reviewed biometric identity credentials');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (4, 'PROFILE_PICTURE_APPROVED', 'Administrator approved an applicant avatar photo');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (5, 'PROFILE_PICTURE_REJECTED', 'Administrator rejected an applicant avatar photo');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (6, 'ITEM_REMOVED', 'Administrator removed an item listing violating policy');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (7, 'USER_SUSPENDED', 'Administrator suspended an account for misconduct');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (8, 'REPORT_RESOLVED', 'Administrator resolved a community safety report');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (9, 'REQUEST_REMOVED', 'Administrator removed a community request');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (10, 'USER_UNSUSPENDED', 'Administrator lifted suspension on an account');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (18, 'REPORT_CREATED', 'User submitted a community report');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (19, 'REPORT_REVIEWED', 'Admin placed report under review');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (20, 'REPORT_DISMISSED', 'Admin dismissed report with no violation');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (21, 'USER_WARNED', 'Admin issued formal warning to user');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (22, 'POST_RESTORED_BY_ADMIN', 'Admin restored a previously removed post');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (23, 'USER_RESTRICTED', 'Admin restricted user account privileges');
INSERT INTO `audit_actions` (`action_id`, `action_name`, `description`) VALUES (24, 'USER_REMOVED', 'Admin deactivated or removed user account');

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE "audit_logs" (
  "audit_log_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "admin_id" bigint unsigned NOT NULL,
  "action_id" smallint unsigned NOT NULL,
  "target_entity_type" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "target_entity_id" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "details" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("audit_log_id"),
  KEY "idx_audit_logs_admin" ("admin_id"),
  KEY "idx_audit_logs_action" ("action_id"),
  KEY "idx_audit_logs_entity" ("target_entity_type","target_entity_id"),
  CONSTRAINT "fk_audit_logs_action" FOREIGN KEY ("action_id") REFERENCES "audit_actions" ("action_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_audit_logs_admin" FOREIGN KEY ("admin_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (1, 5, 1, 'users', '11', 'All documents verified and approved.', '2026-09-05 17:08:42');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (2, 5, 1, 'users', '12', 'All documents verified and approved.', '2026-09-05 17:08:54');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (3, 5, 1, 'users', '14', 'Administrator approved identity verification.', '2026-09-06 05:37:39');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (4, 5, 1, 'users', '15', 'Administrator approved identity verification.', '2026-09-06 05:43:49');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (5, 5, 2, 'users', '15', 'Photo on ID does not match live selfie.', '2026-09-06 05:45:26');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (6, 5, 7, 'user', '15', 'Suspended for 7 days. Reason: Community guidelines violation. Admin note: Multiple warnings ignored.', '2026-09-06 05:59:37');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (7, 5, 10, 'user', '15', 'Suspension lifted. Reason: Suspension lifted by administrator..', '2026-09-06 05:59:41');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (8, 5, 6, 'item', '1', 'Removed item \'Women\'s Blouse\'. Reason: Prohibited item. Admin note: Not allowed in community.', '2026-09-06 05:59:43');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (9, 5, 9, 'request', '1', 'Removed request \'Elementary Textbooks Grade 4\'. Reason: Duplicate request. Note: Duplicate of existing request.', '2026-09-06 05:59:45');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (10, 5, 8, 'report', '1', 'Resolved report on item-3. Action: Post removed. Message: Content removed per guideline violations.', '2026-09-06 05:59:47');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (11, 5, 7, 'user', '17', 'Suspended for 7 days. Reason: Inappropriate behavior or harassment. Admin note: Offensive remarks reported in community listings.', '2026-09-06 06:05:41');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (12, 5, 7, 'user', '18', 'Suspended for 7 days. Reason: Inappropriate behavior or harassment. Admin note: Offensive remarks reported in community listings.', '2026-09-06 06:07:15');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (13, 5, 10, 'user', '18', 'Suspension lifted. Reason: Suspension lifted by administrator..', '2026-09-06 06:07:23');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (14, 5, 6, 'item', '2', 'Removed item \'School Bag\'. Reason: Prohibited item. Admin note: Weapons or hazardous materials are strictly prohibited..', '2026-09-06 06:07:30');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (15, 5, 9, 'request', '2', 'Removed request \'Canned Goods & Rice Support\'. Reason: Duplicate request. Note: Please search existing requests before submitting..', '2026-09-06 06:07:36');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (16, 5, 8, 'report', '2', 'Resolved report on user-8. Action: Warning issued. Message: First formal notice issued regarding listing accuracy..', '2026-09-06 06:07:42');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (17, 5, 1, 'users', '13', 'Administrator approved identity verification.', '2026-09-06 06:50:46');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (18, 5, 19, 'report', '1', 'Admin updated Report #1 status to \'under_review\'.', '2026-09-11 12:25:19');

DROP TABLE IF EXISTS `badges`;
CREATE TABLE "badges" (
  "badge_id" int unsigned NOT NULL AUTO_INCREMENT,
  "badge_code" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "icon" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("badge_id"),
  UNIQUE KEY "uq_badges_code" ("badge_code")
);

INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (1, 'trusted_donor', 'Trusted Donor', '≡ƒÅà', 'Completed 10+ generous item donations to neighbors');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (2, 'community_star', 'Community Star', 'Γ¡É', 'Maintained 4.5+ star average across all community ratings');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (3, 'active_exchanger', 'Active Exchanger', '≡ƒöä', 'Successfully completed 10+ community exchanges');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (4, 'top_contributor', 'Top Contributor', '≡ƒÄû∩╕Å', 'Ranked among top active neighbors in the municipality');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (5, 'verified_neighbor', 'Verified Neighbor', '≡ƒ¢í∩╕Å', 'Completed identity document check and administrator verification');

DROP TABLE IF EXISTS `conversation_participants`;
CREATE TABLE "conversation_participants" (
  "conversation_id" bigint unsigned NOT NULL,
  "user_id" bigint unsigned NOT NULL,
  "joined_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_read_at" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("conversation_id","user_id"),
  KEY "fk_conv_part_user" ("user_id"),
  CONSTRAINT "fk_conv_part_conv" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_conv_part_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE "conversations" (
  "conversation_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "title" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("conversation_id")
);

DROP TABLE IF EXISTS `exchange_history`;
CREATE TABLE "exchange_history" (
  "history_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "exchange_id" bigint unsigned NOT NULL,
  "action" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "performed_by" bigint unsigned NOT NULL,
  "details" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("history_id"),
  KEY "idx_exchange_history_exchange" ("exchange_id"),
  KEY "fk_exchange_hist_user" ("performed_by"),
  CONSTRAINT "fk_exchange_hist_exchange" FOREIGN KEY ("exchange_id") REFERENCES "exchanges" ("exchange_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_exchange_hist_user" FOREIGN KEY ("performed_by") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `exchange_items`;
CREATE TABLE "exchange_items" (
  "exchange_item_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "exchange_id" bigint unsigned NOT NULL,
  "item_id" bigint unsigned NOT NULL,
  "offered_by_user_id" bigint unsigned NOT NULL,
  "role" enum('offered','requested') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("exchange_item_id"),
  UNIQUE KEY "uq_exchange_items_pair" ("exchange_id","item_id"),
  KEY "idx_exchange_items_user" ("offered_by_user_id"),
  KEY "fk_exchange_items_item" ("item_id"),
  CONSTRAINT "fk_exchange_items_exchange" FOREIGN KEY ("exchange_id") REFERENCES "exchanges" ("exchange_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_exchange_items_item" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_exchange_items_user" FOREIGN KEY ("offered_by_user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `exchange_participants`;
CREATE TABLE "exchange_participants" (
  "exchange_id" bigint unsigned NOT NULL,
  "user_id" bigint unsigned NOT NULL,
  "participant_role" enum('offerer','receiver') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "joined_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("exchange_id","user_id"),
  KEY "fk_exchange_part_user" ("user_id"),
  CONSTRAINT "fk_exchange_part_exchange" FOREIGN KEY ("exchange_id") REFERENCES "exchanges" ("exchange_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_exchange_part_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (1, 5, 'offerer', '2026-09-07 08:00:03');
INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (2, 5, 'offerer', '2026-09-07 13:12:59');
INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (3, 5, 'offerer', '2026-09-07 13:46:01');

DROP TABLE IF EXISTS `exchange_statuses`;
CREATE TABLE "exchange_statuses" (
  "exchange_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("exchange_status_id"),
  UNIQUE KEY "uq_exchange_statuses_name" ("status_name")
);

INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (1, 'pending', 'Proposal submitted to owner, awaiting decision');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (2, 'accepted', 'Accepted by recipient, awaiting meeting coordination');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (3, 'meeting_scheduled', 'Meeting date and community location agreed upon');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (4, 'completed', 'Physical handover verified and completed by both parties');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (5, 'cancelled', 'Cancelled by one of the participants before handover');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (6, 'rejected', 'Proposal declined by owner');

DROP TABLE IF EXISTS `exchanges`;
CREATE TABLE "exchanges" (
  "exchange_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "exchange_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "meeting_date" datetime DEFAULT NULL,
  "meeting_location" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "message" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "completed_at" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("exchange_id"),
  KEY "idx_exchanges_status" ("exchange_status_id"),
  CONSTRAINT "fk_exchanges_status" FOREIGN KEY ("exchange_status_id") REFERENCES "exchange_statuses" ("exchange_status_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (1, 2, NULL, 'Plaza', 'Let us trade tools for items!', '2026-09-07 08:00:03', '2026-09-07 08:00:05', NULL);
INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (2, 1, NULL, NULL, 'was', '2026-09-07 13:12:59', '2026-09-07 13:12:59', NULL);
INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (3, 1, NULL, NULL, 'Hi! I would like to exchange my item for your Rice Cooker.', '2026-09-07 13:46:01', '2026-09-07 13:46:01', NULL);

DROP TABLE IF EXISTS `facial_verification_statuses`;
CREATE TABLE "facial_verification_statuses" (
  "status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_code" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("status_id"),
  UNIQUE KEY "uq_facial_verification_statuses_code" ("status_code")
);

INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (1, 'NOT_STARTED', 'Facial selfie capture has not yet been performed');
INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (2, 'PASSED', 'Biometric facial descriptors successfully matched document photo');
INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (3, 'FAILED', 'Facial landmark discrepancies detected or quality below verification threshold');

DROP TABLE IF EXISTS `id_types`;
CREATE TABLE "id_types" (
  "id_type_id" smallint unsigned NOT NULL AUTO_INCREMENT,
  "type_name" varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "label" varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "number_label" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "format_placeholder" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "format_hint" varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "requires_expiration" tinyint(1) NOT NULL DEFAULT '1',
  "extra_field_label" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "extra_field_placeholder" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "help_text" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("id_type_id"),
  UNIQUE KEY "uq_id_types_name" ("type_name")
);

INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (1, 'Philippine National ID / PhilSys ID', 'Philippine National ID (PhilSys)', 'PhilSys Card Number (PCN)', '1234-5678-9012-3456', '16-digit PhilSys Card Number printed on the card', 0, NULL, NULL, 'Permanent National ID for Filipino citizens with no expiration date.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (2, 'Driver\'s License', 'LTO Driver\'s License', 'License Number', 'N01-23-456789', 'Format: A00-00-000000', 1, NULL, NULL, 'Official Land Transportation Office (LTO) driver\'s license card.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (3, 'Philippine Passport', 'Philippine Passport (DFA)', 'Passport Number', 'P1234567A', 'Format: 1 Letter followed by 7-8 digits/characters', 1, NULL, NULL, 'Department of Foreign Affairs issued passport biodata page.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (4, 'UMID (Unified Multi-Purpose ID)', 'Unified Multi-Purpose ID (UMID)', 'Common Reference Number (CRN)', '0000-1234567-8', '12-digit CRN printed on the upper right of the card', 0, NULL, NULL, 'Issued by SSS/GSIS to government and private sector workers.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (5, 'Postal ID', 'PHLPost Postal ID', 'Postal Reference Number (PRN)', '123 456 789 012', '12-digit barcode or PRN number on card front', 1, NULL, NULL, 'Digitized Postal ID issued by the Philippine Postal Corporation.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (6, 'PRC ID (Professional Regulation Commission)', 'Professional Regulation Commission (PRC) ID', 'Registration Number', '0123456', '7-digit Professional License Number', 1, 'Profession / Specialization', 'e.g. Registered Nurse, Civil Engineer', 'Valid PRC identification card for licensed professionals.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (7, 'Senior Citizen ID', 'Senior Citizen ID (OSCA)', 'OSCA Control Number', 'SC-1234-5678', 'Control number issued by your Local Government OSCA', 0, 'Issuing LGU / Municipality', 'e.g. San Fernando, La Union', 'Office for Senior Citizens Affairs identification card.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (8, 'PWD ID', 'Persons with Disability (PWD) ID', 'Persons with Disability ID Number', 'PWD-01234-567', 'Issued by Municipal / City PDAO or MSWDO', 0, 'Issuing Municipality / City', 'e.g. Aringay, La Union', 'Official PWD identification card issued by the local PDAO.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (9, 'Voter\'s Certificate / Voter\'s ID', 'COMELEC Voter\'s ID / Certificate', 'Voter Identification Number (VIN)', '0123-4567A-B890CDE12345', 'COMELEC Voter Identification Number', 0, NULL, NULL, 'Issued by the Commission on Elections (COMELEC).');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (10, 'SSS ID', 'Social Security System (SSS) ID', 'SSS Number', '01-2345678-9', '10-digit SSS member number format: XX-XXXXXXX-X', 0, NULL, NULL, 'Social Security System member identity card.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (11, 'GSIS eCard', 'GSIS eCard / UMID', 'GSIS Business Partner (BP) Number', '2000123456', '10-digit GSIS BP number', 0, NULL, NULL, 'Government Service Insurance System identity card for civil servants.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (12, 'TIN ID', 'Bureau of Internal Revenue (BIR) TIN Card', 'Tax Identification Number (TIN)', '123-456-789-000', '9 to 12 digit Tax Identification Number format', 0, NULL, NULL, 'Official BIR Tax Identification Number card.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (13, 'PhilHealth ID', 'PhilHealth Identification Card (PIC)', 'PhilHealth Identification Number (PIN)', '01-234567890-1', '12-digit PIN format: XX-XXXXXXXXX-X', 0, NULL, NULL, 'Philippine Health Insurance Corporation identity card.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (14, 'Pag-IBIG Loyalty Card', 'Pag-IBIG Loyalty Card Plus', 'Member ID (MID)', '1234-5678-9012', '12-digit Pag-IBIG Membership ID number', 1, NULL, NULL, 'Pag-IBIG Fund Loyalty Card Plus with banking chip.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (15, 'School ID', 'Accredited School / University ID', 'Student Identification Number', '2024-12345-LU', 'Official Student Registration Number', 1, 'School / University Name', 'e.g. Don Mariano Marcos Memorial State University', 'Currently enrolled student ID with valid academic year registration sticker.');
INSERT INTO `id_types` (`id_type_id`, `type_name`, `label`, `number_label`, `format_placeholder`, `format_hint`, `requires_expiration`, `extra_field_label`, `extra_field_placeholder`, `help_text`) VALUES (16, 'Other Government-Issued ID', 'Other Philippine Government-Issued ID', 'Document / Card ID Number', 'GOV-12345678', 'Official number printed on the government credential', 1, 'Issuing Agency or Barangay Office', 'e.g. Barangay San Antonio / Maritime Authority', 'Any recognized official Philippine national or local government photo credential.');

DROP TABLE IF EXISTS `identity_verifications`;
CREATE TABLE "identity_verifications" (
  "identity_verification_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "id_type_id" smallint unsigned NOT NULL,
  "id_number" varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "masked_id_number" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "full_name_on_id" varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "date_of_birth" date NOT NULL,
  "expiration_date" date DEFAULT NULL,
  "extra_info" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "document_reference" longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "facial_selfie_reference" longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "facial_verification_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "verification_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "confidence_score" tinyint unsigned NOT NULL DEFAULT '0',
  "provider" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BayanihanHub-Biometric-Engine',
  "rejection_reason" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "retry_instructions" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "submitted_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_at" timestamp NULL DEFAULT NULL,
  "reviewed_by" bigint unsigned DEFAULT NULL,
  PRIMARY KEY ("identity_verification_id"),
  KEY "idx_identity_verifications_user" ("user_id"),
  KEY "idx_identity_verifications_status" ("verification_status_id"),
  KEY "fk_identity_verif_id_type" ("id_type_id"),
  KEY "fk_identity_verif_face_status" ("facial_verification_status_id"),
  KEY "fk_identity_verif_reviewer" ("reviewed_by"),
  CONSTRAINT "fk_identity_verif_face_status" FOREIGN KEY ("facial_verification_status_id") REFERENCES "facial_verification_statuses" ("status_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_identity_verif_id_type" FOREIGN KEY ("id_type_id") REFERENCES "id_types" ("id_type_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_identity_verif_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_identity_verif_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_identity_verif_verif_status" FOREIGN KEY ("verification_status_id") REFERENCES "verification_statuses" ("verification_status_id") ON DELETE RESTRICT ON UPDATE CASCADE
);


DROP TABLE IF EXISTS `item_categories`;
CREATE TABLE "item_categories" (
  "category_id" int unsigned NOT NULL AUTO_INCREMENT,
  "slug" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "icon" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("category_id"),
  UNIQUE KEY "uq_item_categories_slug" ("slug"),
  UNIQUE KEY "uq_item_categories_name" ("name")
);

INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (1, 'clothing', 'Clothing & Apparel', 'Shirt', 'Men\'s, women\'s, and children\'s apparel, uniforms, and shoes');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (2, 'school-supplies', 'School & Office Supplies', 'BookOpen', 'Backpacks, uniforms, notebooks, stationery, and learning aids');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (3, 'appliances', 'Home Appliances', 'Tv', 'Kitchen cookers, electric fans, irons, and small household devices');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (4, 'books', 'Books & Learning Material', 'Book', 'Textbooks, children storybooks, reviewers, and novels');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (5, 'toys', 'Toys & Games', 'Gamepad2', 'Children toys, puzzles, educational sets, and board games');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (6, 'furniture', 'Furniture', 'Armchair', 'Chairs, study tables, shelves, and home furnishings');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (7, 'food', 'Food & Pantry Essentials', 'Apple', 'Non-perishable canned goods, rice sacks, and community groceries');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (8, 'electronics', 'Electronics & Gadgets', 'Smartphone', 'Phones, cables, radios, chargers, and small digital accessories');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (9, 'tools', 'Tools & Hardware', 'Wrench', 'Carpentry, gardening, plumbing, and home repair tools');
INSERT INTO `item_categories` (`category_id`, `slug`, `name`, `icon`, `description`) VALUES (10, 'other', 'Other Community Goods', 'Package', 'Miscellaneous helpful community items');

DROP TABLE IF EXISTS `item_conditions`;
CREATE TABLE "item_conditions" (
  "condition_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "condition_name" varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("condition_id"),
  UNIQUE KEY "uq_item_conditions_name" ("condition_name")
);

INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (1, 'Brand New', 'Unused, unopened, in original packaging or with tags attached');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (2, 'Like New', 'In near-perfect condition with no noticeable defects');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (3, 'Good Condition', 'Shows minor normal wear but fully functional and clean');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (4, 'Fair', 'Noticeable cosmetic wear but operational');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (5, 'Poor', 'Heavy wear or needs slight maintenance to be useful');

DROP TABLE IF EXISTS `item_images`;
CREATE TABLE "item_images" (
  "item_image_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "item_id" bigint unsigned NOT NULL,
  "image_url" varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "display_order" tinyint unsigned NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("item_image_id"),
  KEY "idx_item_images_item" ("item_id","display_order"),
  CONSTRAINT "fk_item_images_item" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (29, 24, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (30, 25, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (31, 26, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (32, 27, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (33, 28, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (34, 29, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (35, 30, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (36, 31, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (37, 32, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (38, 33, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');

DROP TABLE IF EXISTS `item_locations`;
CREATE TABLE "item_locations" (
  "location_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "address_line" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "barangay" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "municipality" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "province" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "postal_code" varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "latitude" decimal(10,8) DEFAULT NULL,
  "longitude" decimal(11,8) DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("location_id"),
  KEY "idx_item_locations_geo" ("municipality","barangay"),
  KEY "idx_item_locations_lat_lng" ("latitude","longitude")
);

INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (12, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 12:43:32');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (13, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 12:45:02');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (14, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 13:39:59');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (15, 'Municipal Hall', 'Poblacion', 'San Fernando', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 13:53:08');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (16, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 13:59:42');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (32, 'Barangay Poblacion Hall', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (33, 'Poblacion Plaza', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61550000', '120.32120000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (34, 'Rizal Street', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61600000', '120.32000000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (35, 'MacArthur Highway, San Antonio', 'San Antonio', 'Aringay', 'La Union', '2503', '16.39800000', '120.35400000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (36, 'Barangay Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (37, 'Carlatan Coastal Road', 'Carlatan', 'San Fernando', 'La Union', '2500', '16.63100000', '120.31500000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (38, 'Riverside Area, Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (39, 'Poblacion Plaza', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (40, 'San Antonio Barangay Road', 'San Antonio', 'Aringay', 'La Union', '2503', '16.39800000', '120.35400000', '2026-09-11 13:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (41, 'Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 13:48:23');

DROP TABLE IF EXISTS `item_pickup_options`;
CREATE TABLE "item_pickup_options" (
  "pickup_option_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "item_id" bigint unsigned NOT NULL,
  "option_name" varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("pickup_option_id"),
  UNIQUE KEY "uq_item_pickup_options" ("item_id","option_name"),
  CONSTRAINT "fk_item_pickup_item" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (24, 24, 'Barangay Hall Pickup');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (23, 24, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (26, 25, 'Drop off');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (25, 25, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (27, 26, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (29, 27, 'Barangay Hall Pickup');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (28, 27, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (30, 28, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (32, 29, 'Drop off');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (31, 29, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (34, 30, 'Barangay Hall Pickup');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (33, 30, 'Drop off');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (35, 31, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (36, 32, 'Meet up');
INSERT INTO `item_pickup_options` (`pickup_option_id`, `item_id`, `option_name`) VALUES (37, 33, 'Meet up');

DROP TABLE IF EXISTS `item_requests`;
CREATE TABLE "item_requests" (
  "request_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "category_id" int unsigned NOT NULL,
  "urgency_id" tinyint unsigned NOT NULL,
  "request_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "location_id" bigint unsigned NOT NULL,
  "title" varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "needed_before" date NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("request_id"),
  KEY "idx_item_requests_user" ("user_id"),
  KEY "idx_item_requests_category" ("category_id"),
  KEY "idx_item_requests_urgency" ("urgency_id"),
  KEY "idx_item_requests_status" ("request_status_id"),
  KEY "fk_item_requests_location" ("location_id"),
  CONSTRAINT "fk_item_requests_category" FOREIGN KEY ("category_id") REFERENCES "item_categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_item_requests_location" FOREIGN KEY ("location_id") REFERENCES "item_locations" ("location_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_item_requests_status" FOREIGN KEY ("request_status_id") REFERENCES "request_statuses" ("request_status_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_item_requests_urgency" FOREIGN KEY ("urgency_id") REFERENCES "request_urgencies" ("urgency_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_item_requests_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (12, 14, 2, 3, 1, 36, 'Durable Water-Resistant School Backpack', 'Looking for a sturdy backpack for an incoming Grade 7 student. Any dark or neutral color. Will be deeply appreciated.', '2026-09-25', '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (13, 14, 1, 2, 1, 37, 'Toddler & Children\'s Clothing (Ages 3-5)', 'Requesting gently used play clothes, t-shirts, and shorts for 4-year-old boy. Any clean hand-me-downs are welcome.', '2026-10-02', '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (14, 14, 7, 4, 1, 38, 'Pantry Relief Essentials & Rice Sack', 'Requesting a 5kg sack of rice and canned goods for a family recovering from recent typhoon flood in Barangay Poblacion.', '2026-09-18', '2026-09-11 13:48:23', '2026-09-11 13:48:23');

DROP TABLE IF EXISTS `item_statuses`;
CREATE TABLE "item_statuses" (
  "item_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("item_status_id"),
  UNIQUE KEY "uq_item_statuses_name" ("status_name")
);

INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (1, 'available', 'Publicly discoverable and open for requests or exchange proposals');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (2, 'reserved', 'Currently held for an accepted exchange or pending pickup');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (3, 'exchanged', 'Successfully exchanged between community neighbors');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (4, 'donated', 'Successfully received by neighbor as a free donation');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (5, 'draft', 'Saved by owner but not yet published to the community');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (6, 'reported', 'Flagged by community members and hidden pending moderator review');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (7, 'removed', 'Withdrawn by owner or removed by administrator');

DROP TABLE IF EXISTS `item_types`;
CREATE TABLE "item_types" (
  "item_type_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "type_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("item_type_id"),
  UNIQUE KEY "uq_item_types_name" ("type_name")
);

INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (1, 'donation', 'Free surplus item given to fellow neighbors in need');
INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (2, 'exchange', 'Item offered in exchange for another requested item');
INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (3, 'request', 'Community request for an item needed by a neighbor');

DROP TABLE IF EXISTS `items`;
CREATE TABLE "items" (
  "item_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "owner_id" bigint unsigned NOT NULL,
  "category_id" int unsigned NOT NULL,
  "condition_id" tinyint unsigned NOT NULL,
  "item_type_id" tinyint unsigned NOT NULL,
  "item_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "location_id" bigint unsigned NOT NULL,
  "title" varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "quantity" int unsigned NOT NULL DEFAULT '1',
  "availability" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Anytime',
  "views_count" int unsigned NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("item_id"),
  KEY "idx_items_owner" ("owner_id"),
  KEY "idx_items_category" ("category_id"),
  KEY "idx_items_status" ("item_status_id"),
  KEY "idx_items_type" ("item_type_id"),
  KEY "idx_items_location" ("location_id"),
  KEY "fk_items_condition" ("condition_id"),
  CONSTRAINT "fk_items_category" FOREIGN KEY ("category_id") REFERENCES "item_categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_items_condition" FOREIGN KEY ("condition_id") REFERENCES "item_conditions" ("condition_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_items_location" FOREIGN KEY ("location_id") REFERENCES "item_locations" ("location_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_items_owner" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_items_status" FOREIGN KEY ("item_status_id") REFERENCES "item_statuses" ("item_status_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_items_type" FOREIGN KEY ("item_type_id") REFERENCES "item_types" ("item_type_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (24, 14, 2, 1, 1, 1, 32, 'Elementary School Supplies Pack', 'Complete set containing 6 spiral notebooks, pad paper, 12-color crayons, ballpens, pencil case, and ruler for elementary students in need.', 2, 'Weekdays 4pm - 7pm, Barangay Poblacion Hall', 18, '2026-09-11 13:48:23', '2026-09-12 12:04:51');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (25, 14, 4, 3, 1, 1, 33, 'College Algebra & General Science Used Textbooks', 'Set of college and high school reviewer textbooks in good clean condition. No missing pages, slight highlighter marks. Free for any student.', 1, 'Any day after 2pm', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (26, 14, 1, 2, 1, 1, 34, 'Men\'s Clean Office & Casual Polo Shirts', '4 pieces of freshly laundered button-down polo shirts (Size Medium). Worn only a few times, perfect for job interviews or daily work.', 4, 'Weekends anytime', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (27, 14, 3, 3, 1, 1, 35, 'Stainless Steel Cooking Utensils & Frying Pan Set', 'Sturdy stainless steel ladle, spatula, tong, and 24cm non-stick frying pan. Downsizing kitchen items, fully functional and cleaned.', 1, 'Flexible schedule', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (28, 14, 2, 3, 3, 1, 36, 'Durable Water-Resistant School Backpack', 'Looking for a sturdy backpack for an incoming Grade 7 student. Any dark or neutral color. Will be deeply appreciated.', 1, 'Anytime', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (29, 14, 1, 3, 3, 1, 37, 'Toddler & Children\'s Clothing (Ages 3-5)', 'Requesting gently used play clothes, t-shirts, and shorts for 4-year-old boy. Any clean hand-me-downs are welcome.', 3, 'Flexible', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (30, 14, 7, 1, 3, 1, 38, 'Pantry Relief Essentials & Rice Sack', 'Requesting a 5kg sack of rice and canned goods for a family recovering from recent typhoon flood in Barangay Poblacion.', 1, 'Immediate / Urgent', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (31, 14, 4, 2, 2, 1, 39, 'Senior High Engineering Math Reviewer for Grade 10 Science Books', 'Offering SHS STEM calculus and physics review manuals. Looking to swap for Grade 10 science and math modules for my younger sibling.', 1, 'Weekdays after 5pm', 14, '2026-09-11 13:48:23', '2026-09-11 15:41:01');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (32, 14, 3, 3, 2, 1, 40, 'Electric Stand Fan for Induction Cooker or Rice Cooker', 'Standard 16-inch 3-speed desk/stand fan in 100% working condition. Looking to trade for a small rice cooker or single induction stove.', 1, 'Weekends', 14, '2026-09-11 13:48:23', '2026-09-11 15:40:41');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (33, 14, 1, 2, 2, 1, 41, 'Women\'s Denim Jacket (Medium) for School Uniform Blouses', 'Classic blue denim jacket in great condition. Want to exchange for 2 white high school uniform blouses (Size Medium or Large).', 1, 'Weekdays anytime', 12, '2026-09-11 13:48:23', '2026-09-11 13:48:23');

DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE "message_reactions" (
  "reaction_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "message_id" bigint unsigned NOT NULL,
  "user_id" bigint unsigned NOT NULL,
  "reaction" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("reaction_id"),
  UNIQUE KEY "uq_message_user_reaction" ("message_id","user_id"),
  KEY "fk_react_user" ("user_id"),
  CONSTRAINT "fk_react_message" FOREIGN KEY ("message_id") REFERENCES "messages" ("message_id") ON DELETE CASCADE,
  CONSTRAINT "fk_react_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE
);

DROP TABLE IF EXISTS `message_types`;
CREATE TABLE "message_types" (
  "message_type_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "type_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("message_type_id"),
  UNIQUE KEY "uq_message_types_name" ("type_name")
);

INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (3, 'file');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (2, 'image');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (4, 'system');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (1, 'text');

DROP TABLE IF EXISTS `messages`;
CREATE TABLE "messages" (
  "message_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "conversation_id" bigint unsigned NOT NULL,
  "sender_id" bigint unsigned NOT NULL,
  "message_type_id" tinyint unsigned NOT NULL DEFAULT '1',
  "content" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "file_url" varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "file_name" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_unsent" tinyint(1) NOT NULL DEFAULT '0',
  "unsent_at" datetime DEFAULT NULL,
  "is_edited" tinyint(1) NOT NULL DEFAULT '0',
  "edited_at" datetime DEFAULT NULL,
  "reply_to_message_id" bigint unsigned DEFAULT NULL,
  PRIMARY KEY ("message_id"),
  KEY "idx_messages_conversation_date" ("conversation_id","created_at"),
  KEY "idx_messages_sender" ("sender_id"),
  KEY "fk_messages_type" ("message_type_id"),
  KEY "fk_reply_msg" ("reply_to_message_id"),
  CONSTRAINT "fk_messages_conv" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_messages_type" FOREIGN KEY ("message_type_id") REFERENCES "message_types" ("message_type_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_reply_msg" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages" ("message_id") ON DELETE SET NULL
);

DROP TABLE IF EXISTS `notification_types`;
CREATE TABLE "notification_types" (
  "notification_type_id" smallint unsigned NOT NULL AUTO_INCREMENT,
  "type_code" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "display_name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("notification_type_id"),
  UNIQUE KEY "uq_notification_types_code" ("type_code")
);

INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (1, 'new_message', 'New Message', 'Direct chat message from a neighbor');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (2, 'exchange_request', 'Exchange Proposal', 'Neighbor offered an item to exchange');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (3, 'exchange_accepted', 'Exchange Accepted', 'Your exchange proposal was accepted');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (4, 'exchange_rejected', 'Exchange Declined', 'Your exchange proposal was declined');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (5, 'exchange_completed', 'Exchange Completed', 'Exchange transaction marked completed');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (6, 'item_favorited', 'Item Saved', 'A neighbor saved your item listing');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (7, 'request_response', 'Request Response', 'A neighbor offered help for your community request');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (8, 'new_nearby_item', 'New Nearby Item', 'New item donation posted in your barangay');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (9, 'admin_announcement', 'Community Announcement', 'Important notice from barangay safety administration');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (10, 'profile_picture_approved', 'Profile Picture Approved', 'Your submitted avatar was approved by moderators');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (11, 'profile_picture_rejected', 'Profile Picture Rejected', 'Your avatar did not meet guidelines');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (12, 'identity_verification_approved', 'Identity Verified & Account Approved', 'Your account has been approved by administrator');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (13, 'identity_verification_rejected', 'Registration Rejected', 'Your identity documents were not approved');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (14, 'system', 'System Notice', 'General platform system update');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (15, 'post_removed', 'Post Removed', 'Your listing was removed by an administrator');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (16, 'request_removed', 'Request Removed', 'Your community request was removed by an administrator');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (17, 'report_resolved', 'Report Update', 'A moderation report involving your content was resolved');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (18, 'account_suspended', 'Account Suspended', 'Your account has been temporarily or permanently suspended');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (19, 'account_unsuspended', 'Account Restored', 'Your account suspension has been lifted');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (20, 'report_received', 'Report Received', 'Community report submission confirmation');
INSERT INTO `notification_types` (`notification_type_id`, `type_code`, `display_name`, `description`) VALUES (21, 'user_warned', 'Account Warning', 'Formal moderation warning notice');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE "notifications" (
  "notification_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "notification_type_id" smallint unsigned NOT NULL,
  "title" varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "message" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "link" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "related_user_id" bigint unsigned DEFAULT NULL,
  "related_item_id" bigint unsigned DEFAULT NULL,
  "is_read" tinyint(1) NOT NULL DEFAULT '0',
  "read_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("notification_id"),
  KEY "idx_notifications_user_read" ("user_id","is_read","created_at"),
  KEY "fk_notifications_type" ("notification_type_id"),
  KEY "fk_notifications_rel_user" ("related_user_id"),
  KEY "fk_notifications_rel_item" ("related_item_id"),
  CONSTRAINT "fk_notifications_rel_item" FOREIGN KEY ("related_item_id") REFERENCES "items" ("item_id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_notifications_rel_user" FOREIGN KEY ("related_user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_notifications_type" FOREIGN KEY ("notification_type_id") REFERENCES "notification_types" ("notification_type_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (15, 5, 3, 'Exchange Proposal Accepted!', 'Your trade proposal has been accepted! You can now coordinate handover details.', '/exchanges', NULL, NULL, 1, '2026-09-07 08:12:23', '2026-09-07 08:00:06');
INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (20, 5, 7, 'Community Assistance Fulfilled!', 'Admin User offered support and your request "Request for: E2E Hand Tools Set" has been fulfilled!', '/requests', 5, NULL, 1, '2026-09-08 13:52:16', '2026-09-07 13:43:34');
INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (25, 5, 7, 'Community Assistance Fulfilled!', 'Admin User offered support and your request "Request for: Children\'s Books" has been fulfilled!', '/requests', 5, NULL, 1, '2026-09-08 13:52:16', '2026-09-07 13:58:22');

DROP TABLE IF EXISTS `profile_picture_statuses`;
CREATE TABLE "profile_picture_statuses" (
  "status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_code" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("status_id"),
  UNIQUE KEY "uq_profile_picture_statuses_code" ("status_code")
);

INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (1, 'pending', 'Avatar photo uploaded and awaiting administrator moderation');
INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (2, 'approved', 'Avatar approved and actively displayed across neighbor interactions');
INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (3, 'rejected', 'Avatar rejected due to community guideline violations');

DROP TABLE IF EXISTS `profile_pictures`;
CREATE TABLE "profile_pictures" (
  "profile_picture_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "file_reference" longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "is_active" tinyint(1) NOT NULL DEFAULT '0',
  "rejection_reason" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "submitted_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_at" timestamp NULL DEFAULT NULL,
  "reviewed_by" bigint unsigned DEFAULT NULL,
  PRIMARY KEY ("profile_picture_id"),
  KEY "idx_profile_pictures_user" ("user_id"),
  KEY "idx_profile_pictures_status" ("status_id"),
  KEY "fk_profile_pictures_reviewer" ("reviewed_by"),
  CONSTRAINT "fk_profile_pictures_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_profile_pictures_status" FOREIGN KEY ("status_id") REFERENCES "profile_picture_statuses" ("status_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_profile_pictures_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);


DROP TABLE IF EXISTS `profiles`;
CREATE TABLE "profiles" (
  "profile_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "username" varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "first_name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "middle_name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "last_name" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "bio" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "address_line" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "barangay" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "municipality" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "province" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "latitude" decimal(10,8) DEFAULT NULL,
  "longitude" decimal(11,8) DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("profile_id"),
  UNIQUE KEY "uq_profiles_user_id" ("user_id"),
  UNIQUE KEY "uq_profiles_username" ("username"),
  KEY "idx_profiles_location" ("municipality","barangay"),
  CONSTRAINT "fk_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (2, 5, 'admin', 'Admin', NULL, 'User', '09170000000', NULL, 'Municipal Hall', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-05 16:51:42', '2026-09-06 05:43:19');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (11, 14, 'jeho', 'Jehosue', NULL, 'Biscarra', '+639923314755', 'Community Member', 'Dangdangla', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-05 17:26:45', '2026-09-05 17:26:45');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (16, 19, 'student1', 'Student', NULL, '1', '09171110001', NULL, 'Community Center', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (17, 20, 'student2', 'Student', NULL, '2', '09171110002', NULL, 'Community Center', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (18, 21, 'juandelacruz', 'Juan', NULL, 'Dela Cruz', '09181234501', NULL, 'Community Center', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (19, 22, 'mariasantos', 'Maria', NULL, 'Santos', '09181234502', NULL, 'Community Center', 'Catbangen', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (20, 23, 'carlomendoza', 'Carlo', NULL, 'Mendoza', '09181234503', NULL, 'Community Center', 'Sevilla', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (21, 24, 'beareyes', 'Bea', NULL, 'Reyes', '09181234504', NULL, 'Community Center', 'Lingsat', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');

DROP TABLE IF EXISTS `ratings`;
CREATE TABLE "ratings" (
  "rating_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "exchange_id" bigint unsigned NOT NULL,
  "rater_id" bigint unsigned NOT NULL,
  "rated_user_id" bigint unsigned NOT NULL,
  "score" tinyint unsigned NOT NULL,
  "review" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("rating_id"),
  UNIQUE KEY "uq_ratings_exchange_pair" ("exchange_id","rater_id","rated_user_id"),
  KEY "idx_ratings_rated_user" ("rated_user_id"),
  KEY "fk_ratings_rater" ("rater_id"),
  CONSTRAINT "fk_ratings_exchange" FOREIGN KEY ("exchange_id") REFERENCES "exchanges" ("exchange_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_ratings_rated_user" FOREIGN KEY ("rated_user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_ratings_rater" FOREIGN KEY ("rater_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "chk_ratings_score" CHECK ((`score` between 1 and 5))
);

DROP TABLE IF EXISTS `report_reasons`;
CREATE TABLE "report_reasons" (
  "reason_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "reason_code" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("reason_id"),
  UNIQUE KEY "uq_report_reasons_code" ("reason_code")
);

INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (1, 'inappropriate', 'Inappropriate or offensive content');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (2, 'spam', 'Commercial advertisement, repetitive spam, or duplicate listing');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (3, 'scam', 'Fraudulent, counterfeit, or misleading information');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (4, 'offensive', 'Harassment, hate speech, or disrespectful behavior');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (5, 'duplicate', 'Duplicate posting of an existing item');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (6, 'other', 'Other community guideline violations');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (19, 'scam_fraud', 'Scam, fraud, or fraudulent request');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (20, 'prohibited_item', 'Prohibited, hazardous, or illegal item');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (21, 'misleading_information', 'Misleading, false, or inaccurate information');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (22, 'inappropriate_content', 'Inappropriate, abusive, or sexually explicit content');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (23, 'harassment', 'Harassment, hate speech, or bullying');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (24, 'wrong_category', 'Wrong category or misclassified item');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (25, 'fake_identity', 'Fake identity, impersonation, or deceptive account');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (26, 'inappropriate_behavior', 'Inappropriate behavior or violation of community standards');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (27, 'suspicious_activity', 'Suspicious activity or suspicious communication');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (28, 'false_information', 'False or fabricated information in request');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (29, 'inappropriate_request', 'Inappropriate or commercial request');
INSERT INTO `report_reasons` (`reason_id`, `reason_code`, `description`) VALUES (30, 'prohibited_request', 'Prohibited or illegal request');

DROP TABLE IF EXISTS `report_statuses`;
CREATE TABLE "report_statuses" (
  "report_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("report_status_id"),
  UNIQUE KEY "uq_report_statuses_name" ("status_name")
);

INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (1, 'pending', 'Submitted and awaiting moderator investigation');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (2, 'reviewed', 'Under active review by administrator');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (3, 'resolved', 'Appropriate disciplinary or cleanup action taken');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (4, 'dismissed', 'Investigated and determined not to violate guidelines');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (6, 'under_review', 'Report is currently being reviewed by an admin');

DROP TABLE IF EXISTS `report_target_types`;
CREATE TABLE "report_target_types" (
  "target_type_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "type_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("target_type_id"),
  UNIQUE KEY "uq_report_target_types_name" ("type_name")
);

INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (2, 'item');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (3, 'message');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (5, 'request');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (1, 'user');

DROP TABLE IF EXISTS `reports`;
CREATE TABLE "reports" (
  "report_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "reporter_id" bigint unsigned NOT NULL,
  "target_type_id" tinyint unsigned NOT NULL,
  "target_id" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "reason_id" tinyint unsigned NOT NULL,
  "status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "description" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "resolved_by" bigint unsigned DEFAULT NULL,
  "resolution_note" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("report_id"),
  KEY "idx_reports_status" ("status_id"),
  KEY "idx_reports_target" ("target_type_id","target_id"),
  KEY "fk_reports_reporter" ("reporter_id"),
  KEY "fk_reports_reason" ("reason_id"),
  KEY "fk_reports_resolver" ("resolved_by"),
  CONSTRAINT "fk_reports_reason" FOREIGN KEY ("reason_id") REFERENCES "report_reasons" ("reason_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_reports_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_reports_resolver" FOREIGN KEY ("resolved_by") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_reports_status" FOREIGN KEY ("status_id") REFERENCES "report_statuses" ("report_status_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_reports_target_type" FOREIGN KEY ("target_type_id") REFERENCES "report_target_types" ("target_type_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `request_images`;
CREATE TABLE "request_images" (
  "request_image_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "request_id" bigint unsigned NOT NULL,
  "image_url" varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "display_order" tinyint unsigned NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("request_image_id"),
  KEY "idx_request_images_req" ("request_id","display_order"),
  CONSTRAINT "fk_request_images_request" FOREIGN KEY ("request_id") REFERENCES "item_requests" ("request_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (2, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (3, 13, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (4, 14, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 13:48:23');

DROP TABLE IF EXISTS `request_statuses`;
CREATE TABLE "request_statuses" (
  "request_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("request_status_id"),
  UNIQUE KEY "uq_request_statuses_name" ("status_name")
);

INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (1, 'active', 'Actively seeking assistance from the neighborhood');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (2, 'in_progress', 'Neighbor has stepped forward to fulfill the request');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (3, 'completed', 'Request successfully fulfilled and closed');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (4, 'cancelled', 'Closed by requester or expired');

DROP TABLE IF EXISTS `request_urgencies`;
CREATE TABLE "request_urgencies" (
  "urgency_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "urgency_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "level" tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY ("urgency_id"),
  UNIQUE KEY "uq_request_urgencies_name" ("urgency_name")
);

INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (1, 'low', 1);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (2, 'medium', 2);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (3, 'high', 3);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (4, 'critical', 4);

DROP TABLE IF EXISTS `roles`;
CREATE TABLE "roles" (
  "role_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "role_name" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("role_id"),
  UNIQUE KEY "uq_roles_name" ("role_name")
);

INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (1, 'admin', 'System and barangay safety moderator with full verification privileges');
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (2, 'user', 'Standard verified community neighbor');
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (3, 'guest', 'Unverified visitor with browse-only capabilities');

DROP TABLE IF EXISTS `saved_items`;
CREATE TABLE "saved_items" (
  "user_id" bigint unsigned NOT NULL,
  "item_id" bigint unsigned NOT NULL,
  "saved_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id","item_id"),
  KEY "fk_saved_items_item" ("item_id"),
  CONSTRAINT "fk_saved_items_item" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_saved_items_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE "user_badges" (
  "user_id" bigint unsigned NOT NULL,
  "badge_id" int unsigned NOT NULL,
  "earned_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id","badge_id"),
  KEY "fk_user_badges_badge" ("badge_id"),
  CONSTRAINT "fk_user_badges_badge" FOREIGN KEY ("badge_id") REFERENCES "badges" ("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_user_badges_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE "user_roles" (
  "user_id" bigint unsigned NOT NULL,
  "role_id" tinyint unsigned NOT NULL,
  "assigned_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id","role_id"),
  KEY "fk_user_roles_role" ("role_id"),
  CONSTRAINT "fk_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("role_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (5, 1, '2026-09-05 16:51:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (14, 2, '2026-09-05 17:26:45');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (19, 1, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (20, 1, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (21, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (22, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (23, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (24, 2, '2026-09-12 20:17:00');

DROP TABLE IF EXISTS `user_suspensions`;
CREATE TABLE "user_suspensions" (
  "suspension_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "user_id" bigint unsigned NOT NULL,
  "suspended_by" bigint unsigned NOT NULL,
  "start_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" timestamp NULL DEFAULT NULL,
  "reason" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "message" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "status" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("suspension_id"),
  KEY "idx_user_suspensions_user" ("user_id"),
  KEY "idx_user_suspensions_status" ("status"),
  KEY "fk_user_suspensions_admin" ("suspended_by"),
  CONSTRAINT "fk_user_suspensions_admin" FOREIGN KEY ("suspended_by") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_user_suspensions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `users`;
CREATE TABLE "users" (
  "user_id" bigint unsigned NOT NULL AUTO_INCREMENT,
  "email" varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "password_hash" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "account_status_id" tinyint unsigned NOT NULL DEFAULT '1',
  "is_suspended" tinyint(1) NOT NULL DEFAULT '0',
  "is_trusted" tinyint(1) NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "last_active_at" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("user_id"),
  UNIQUE KEY "uq_users_email" ("email"),
  KEY "idx_users_account_status" ("account_status_id"),
  CONSTRAINT "fk_users_account_status" FOREIGN KEY ("account_status_id") REFERENCES "account_statuses" ("account_status_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (5, 'admin@bayanihanhub.com', 'admin123', 2, 0, 1, '2026-09-05 16:51:42', '2026-09-12 11:05:28', '2026-09-12 11:05:28');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (14, 'jehosuebiscarra@gmail.com', 'password123', 2, 0, 1, '2026-09-05 17:26:45', '2026-09-12 12:04:34', '2026-09-12 12:04:34');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (19, 'student1@bayanihanhub.com', 'student123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (20, 'student2@bayanihanhub.com', 'student123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (21, 'juan.delacruz@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (22, 'maria.santos@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (23, 'carlo.mendoza@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (24, 'bea.reyes@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', '2026-09-12 20:17:00');

DROP TABLE IF EXISTS `verification_statuses`;
CREATE TABLE "verification_statuses" (
  "verification_status_id" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "status_code" varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("verification_status_id"),
  UNIQUE KEY "uq_verification_statuses_code" ("status_code")
);

INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (1, 'PENDING', 'Submitted and awaiting administrator review');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (2, 'APPROVED', 'Reviewed and approved by authorized administrator');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (3, 'REJECTED', 'Declined by administrator');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (4, 'RETRY_REQUIRED', 'Returned to user for clearer photo or corrected document details');

SET FOREIGN_KEY_CHECKS=1;
