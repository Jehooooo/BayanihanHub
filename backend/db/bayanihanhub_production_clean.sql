-- BayanihanHub Clean Production Schema & Seed Data
-- Exact Demo Data: 10 Approved Users, 2 Approved Verifications, 11 Available Items, 5 Requests (4 Open, 1 Closed), 0 Reports
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `account_statuses`;
CREATE TABLE `account_statuses` (
  `account_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`account_status_id`),
  UNIQUE KEY `uq_account_statuses_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (1, 'PENDING', 'Pending Verification', 'Newly registered account awaiting administrator review');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (2, 'APPROVED', 'Active & Approved', 'Account verified by administrator and permitted to authenticate');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (3, 'REJECTED', 'Registration Rejected', 'Account application declined by administrator');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (4, 'REQUIRES_REVIEW', 'Requires Additional Review', 'Application flagged for supplementary documentation or moderation');
INSERT INTO `account_statuses` (`account_status_id`, `status_code`, `display_name`, `description`) VALUES (5, 'SUSPENDED', 'Account Suspended', 'Account temporarily or permanently suspended by administrator');

DROP TABLE IF EXISTS `audit_actions`;
CREATE TABLE `audit_actions` (
  `action_id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `action_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`action_id`),
  UNIQUE KEY `uq_audit_actions_name` (`action_name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `audit_logs` (
  `audit_log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` bigint unsigned NOT NULL,
  `action_id` smallint unsigned NOT NULL,
  `target_entity_type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_entity_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_audit_logs_admin` (`admin_id`),
  KEY `idx_audit_logs_action` (`action_id`),
  KEY `idx_audit_logs_entity` (`target_entity_type`,`target_entity_id`),
  CONSTRAINT `fk_audit_logs_action` FOREIGN KEY (`action_id`) REFERENCES `audit_actions` (`action_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (1, 5, 1, 'users', '11', 'All documents verified and approved.', '2026-09-06 01:08:42');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (2, 5, 1, 'users', '12', 'All documents verified and approved.', '2026-09-06 01:08:54');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (3, 5, 1, 'users', '14', 'Administrator approved identity verification.', '2026-09-06 13:37:39');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (4, 5, 1, 'users', '15', 'Administrator approved identity verification.', '2026-09-06 13:43:49');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (5, 5, 2, 'users', '15', 'Photo on ID does not match live selfie.', '2026-09-06 13:45:26');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (6, 5, 7, 'user', '15', 'Suspended for 7 days. Reason: Community guidelines violation. Admin note: Multiple warnings ignored.', '2026-09-06 13:59:37');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (7, 5, 10, 'user', '15', 'Suspension lifted. Reason: Suspension lifted by administrator..', '2026-09-06 13:59:41');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (8, 5, 6, 'item', '1', 'Removed item \'Women\'s Blouse\'. Reason: Prohibited item. Admin note: Not allowed in community.', '2026-09-06 13:59:43');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (9, 5, 9, 'request', '1', 'Removed request \'Elementary Textbooks Grade 4\'. Reason: Duplicate request. Note: Duplicate of existing request.', '2026-09-06 13:59:45');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (10, 5, 8, 'report', '1', 'Resolved report on item-3. Action: Post removed. Message: Content removed per guideline violations.', '2026-09-06 13:59:47');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (11, 5, 7, 'user', '17', 'Suspended for 7 days. Reason: Inappropriate behavior or harassment. Admin note: Offensive remarks reported in community listings.', '2026-09-06 14:05:41');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (12, 5, 7, 'user', '18', 'Suspended for 7 days. Reason: Inappropriate behavior or harassment. Admin note: Offensive remarks reported in community listings.', '2026-09-06 14:07:15');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (13, 5, 10, 'user', '18', 'Suspension lifted. Reason: Suspension lifted by administrator..', '2026-09-06 14:07:23');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (14, 5, 6, 'item', '2', 'Removed item \'School Bag\'. Reason: Prohibited item. Admin note: Weapons or hazardous materials are strictly prohibited..', '2026-09-06 14:07:30');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (15, 5, 9, 'request', '2', 'Removed request \'Canned Goods & Rice Support\'. Reason: Duplicate request. Note: Please search existing requests before submitting..', '2026-09-06 14:07:36');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (16, 5, 8, 'report', '2', 'Resolved report on user-8. Action: Warning issued. Message: First formal notice issued regarding listing accuracy..', '2026-09-06 14:07:42');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (17, 5, 1, 'users', '13', 'Administrator approved identity verification.', '2026-09-06 14:50:46');
INSERT INTO `audit_logs` (`audit_log_id`, `admin_id`, `action_id`, `target_entity_type`, `target_entity_id`, `details`, `created_at`) VALUES (18, 5, 19, 'report', '1', 'Admin updated Report #1 status to \'under_review\'.', '2026-09-11 20:25:19');

DROP TABLE IF EXISTS `badges`;
CREATE TABLE `badges` (
  `badge_id` int unsigned NOT NULL AUTO_INCREMENT,
  `badge_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`badge_id`),
  UNIQUE KEY `uq_badges_code` (`badge_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (1, 'trusted_donor', 'Trusted Donor', '🏅', 'Completed 10+ generous item donations to neighbors');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (2, 'community_star', 'Community Star', '⭐', 'Maintained 4.5+ star average across all community ratings');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (3, 'active_exchanger', 'Active Exchanger', '🔄', 'Successfully completed 10+ community exchanges');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (4, 'top_contributor', 'Top Contributor', '🎖️', 'Ranked among top active neighbors in the municipality');
INSERT INTO `badges` (`badge_id`, `badge_code`, `name`, `icon`, `description`) VALUES (5, 'verified_neighbor', 'Verified Neighbor', '🛡️', 'Completed identity document check and administrator verification');

DROP TABLE IF EXISTS `conversation_participants`;
CREATE TABLE `conversation_participants` (
  `conversation_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `fk_conv_part_user` (`user_id`),
  CONSTRAINT `fk_conv_part_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conv_part_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `exchange_history`;
CREATE TABLE `exchange_history` (
  `history_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exchange_id` bigint unsigned NOT NULL,
  `action` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` bigint unsigned NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_exchange_history_exchange` (`exchange_id`),
  KEY `fk_exchange_hist_user` (`performed_by`),
  CONSTRAINT `fk_exchange_hist_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchange_hist_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `exchange_items`;
CREATE TABLE `exchange_items` (
  `exchange_item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exchange_id` bigint unsigned NOT NULL,
  `item_id` bigint unsigned NOT NULL,
  `offered_by_user_id` bigint unsigned NOT NULL,
  `role` enum('offered','requested') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`exchange_item_id`),
  UNIQUE KEY `uq_exchange_items_pair` (`exchange_id`,`item_id`),
  KEY `idx_exchange_items_user` (`offered_by_user_id`),
  KEY `fk_exchange_items_item` (`item_id`),
  CONSTRAINT `fk_exchange_items_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchange_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_exchange_items_user` FOREIGN KEY (`offered_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `exchange_participants`;
CREATE TABLE `exchange_participants` (
  `exchange_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `participant_role` enum('offerer','receiver') COLLATE utf8mb4_unicode_ci NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_id`,`user_id`),
  KEY `fk_exchange_part_user` (`user_id`),
  CONSTRAINT `fk_exchange_part_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchange_part_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (1, 5, 'offerer', '2026-09-07 16:00:03');
INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (2, 5, 'offerer', '2026-09-07 21:12:59');
INSERT INTO `exchange_participants` (`exchange_id`, `user_id`, `participant_role`, `joined_at`) VALUES (3, 5, 'offerer', '2026-09-07 21:46:01');

DROP TABLE IF EXISTS `exchange_statuses`;
CREATE TABLE `exchange_statuses` (
  `exchange_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`exchange_status_id`),
  UNIQUE KEY `uq_exchange_statuses_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (1, 'pending', 'Proposal submitted to owner, awaiting decision');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (2, 'accepted', 'Accepted by recipient, awaiting meeting coordination');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (3, 'meeting_scheduled', 'Meeting date and community location agreed upon');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (4, 'completed', 'Physical handover verified and completed by both parties');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (5, 'cancelled', 'Cancelled by one of the participants before handover');
INSERT INTO `exchange_statuses` (`exchange_status_id`, `status_name`, `description`) VALUES (6, 'rejected', 'Proposal declined by owner');

DROP TABLE IF EXISTS `exchanges`;
CREATE TABLE `exchanges` (
  `exchange_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exchange_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `meeting_date` datetime DEFAULT NULL,
  `meeting_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`exchange_id`),
  KEY `idx_exchanges_status` (`exchange_status_id`),
  CONSTRAINT `fk_exchanges_status` FOREIGN KEY (`exchange_status_id`) REFERENCES `exchange_statuses` (`exchange_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (1, 2, NULL, 'Plaza', 'Let us trade tools for items!', '2026-09-07 16:00:03', '2026-09-07 16:00:05', NULL);
INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (2, 1, NULL, NULL, 'was', '2026-09-07 21:12:59', '2026-09-07 21:12:59', NULL);
INSERT INTO `exchanges` (`exchange_id`, `exchange_status_id`, `meeting_date`, `meeting_location`, `message`, `created_at`, `updated_at`, `completed_at`) VALUES (3, 1, NULL, NULL, 'Hi! I would like to exchange my item for your Rice Cooker.', '2026-09-07 21:46:01', '2026-09-07 21:46:01', NULL);

DROP TABLE IF EXISTS `facial_verification_statuses`;
CREATE TABLE `facial_verification_statuses` (
  `status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `uq_facial_verification_statuses_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (1, 'NOT_STARTED', 'Facial selfie capture has not yet been performed');
INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (2, 'PASSED', 'Biometric facial descriptors successfully matched document photo');
INSERT INTO `facial_verification_statuses` (`status_id`, `status_code`, `description`) VALUES (3, 'FAILED', 'Facial landmark discrepancies detected or quality below verification threshold');

DROP TABLE IF EXISTS `id_types`;
CREATE TABLE `id_types` (
  `id_type_id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format_placeholder` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format_hint` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requires_expiration` tinyint(1) NOT NULL DEFAULT '1',
  `extra_field_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `extra_field_placeholder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `help_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_type_id`),
  UNIQUE KEY `uq_id_types_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `identity_verifications` (
  `identity_verification_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `id_type_id` smallint unsigned NOT NULL,
  `id_number` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `masked_id_number` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name_on_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `extra_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_reference` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `facial_selfie_reference` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `facial_verification_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `verification_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `confidence_score` tinyint unsigned NOT NULL DEFAULT '0',
  `provider` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BayanihanHub-Biometric-Engine',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `retry_instructions` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`identity_verification_id`),
  KEY `idx_identity_verifications_user` (`user_id`),
  KEY `idx_identity_verifications_status` (`verification_status_id`),
  KEY `fk_identity_verif_id_type` (`id_type_id`),
  KEY `fk_identity_verif_face_status` (`facial_verification_status_id`),
  KEY `fk_identity_verif_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_identity_verif_face_status` FOREIGN KEY (`facial_verification_status_id`) REFERENCES `facial_verification_statuses` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_identity_verif_id_type` FOREIGN KEY (`id_type_id`) REFERENCES `id_types` (`id_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_identity_verif_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_identity_verif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_identity_verif_verif_status` FOREIGN KEY (`verification_status_id`) REFERENCES `verification_statuses` (`verification_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `identity_verifications` (`identity_verification_id`, `user_id`, `id_type_id`, `id_number`, `masked_id_number`, `full_name_on_id`, `date_of_birth`, `expiration_date`, `extra_info`, `document_reference`, `facial_selfie_reference`, `facial_verification_status_id`, `verification_status_id`, `confidence_score`, `provider`, `rejection_reason`, `retry_instructions`, `submitted_at`, `reviewed_at`, `reviewed_by`) VALUES (1, 21, 1, '4829-1029-4820-9921', '••••-••••-••••-9921', 'JUAN DELA CRUZ', '2001-05-14', '2031-05-14', NULL, 'DOC_VERIFIED_ENCRYPTED', '', 2, 2, 96, 'BayanihanHub-Biometric-Engine', NULL, NULL, '2026-09-12 09:30:00', '2026-09-12 10:00:00', 5);
INSERT INTO `identity_verifications` (`identity_verification_id`, `user_id`, `id_type_id`, `id_number`, `masked_id_number`, `full_name_on_id`, `date_of_birth`, `expiration_date`, `extra_info`, `document_reference`, `facial_selfie_reference`, `facial_verification_status_id`, `verification_status_id`, `confidence_score`, `provider`, `rejection_reason`, `retry_instructions`, `submitted_at`, `reviewed_at`, `reviewed_by`) VALUES (2, 22, 2, 'N02-18-938210', '••••-••-938210', 'MARIA SANTOS', '2002-11-20', '2029-11-20', NULL, 'DOC_VERIFIED_ENCRYPTED', '', 2, 2, 98, 'BayanihanHub-Biometric-Engine', NULL, NULL, '2026-09-12 09:45:00', '2026-09-12 10:15:00', 5);

DROP TABLE IF EXISTS `item_categories`;
CREATE TABLE `item_categories` (
  `category_id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_item_categories_slug` (`slug`),
  UNIQUE KEY `uq_item_categories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `item_conditions` (
  `condition_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `condition_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`condition_id`),
  UNIQUE KEY `uq_item_conditions_name` (`condition_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (1, 'Brand New', 'Unused, unopened, in original packaging or with tags attached');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (2, 'Like New', 'In near-perfect condition with no noticeable defects');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (3, 'Good Condition', 'Shows minor normal wear but fully functional and clean');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (4, 'Fair', 'Noticeable cosmetic wear but operational');
INSERT INTO `item_conditions` (`condition_id`, `condition_name`, `description`) VALUES (5, 'Poor', 'Heavy wear or needs slight maintenance to be useful');

DROP TABLE IF EXISTS `item_images`;
CREATE TABLE `item_images` (
  `item_image_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint unsigned NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_image_id`),
  KEY `idx_item_images_item` (`item_id`,`display_order`),
  CONSTRAINT `fk_item_images_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (29, 24, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (30, 25, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (31, 26, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (32, 27, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (33, 28, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (34, 29, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (35, 30, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (36, 31, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (37, 32, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (38, 33, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `item_images` (`item_image_id`, `item_id`, `image_url`, `display_order`, `created_at`) VALUES (39, 34, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', 0, '2026-09-12 10:00:00');

DROP TABLE IF EXISTS `item_locations`;
CREATE TABLE `item_locations` (
  `location_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `address_line` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barangay` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `municipality` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`location_id`),
  KEY `idx_item_locations_geo` (`municipality`,`barangay`),
  KEY `idx_item_locations_lat_lng` (`latitude`,`longitude`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (12, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 20:43:32');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (13, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 20:45:02');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (14, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 21:39:59');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (15, 'Municipal Hall', 'Poblacion', 'San Fernando', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 21:53:08');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (16, '123 Rizal St.', 'San Antonio', 'Aringay', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-07 21:59:42');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (32, 'Barangay Poblacion Hall', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (33, 'Poblacion Plaza', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61550000', '120.32120000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (34, 'Rizal Street', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61600000', '120.32000000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (35, 'MacArthur Highway, San Antonio', 'San Antonio', 'Aringay', 'La Union', '2503', '16.39800000', '120.35400000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (36, 'Barangay Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (37, 'Carlatan Coastal Road', 'Carlatan', 'San Fernando', 'La Union', '2500', '16.63100000', '120.31500000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (38, 'Riverside Area, Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (39, 'Poblacion Plaza', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (40, 'San Antonio Barangay Road', 'San Antonio', 'Aringay', 'La Union', '2503', '16.39800000', '120.35400000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (41, 'Poblacion', 'Poblacion', 'San Fernando', 'La Union', '2500', '16.61590000', '120.32090000', '2026-09-11 21:48:23');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (42, 'Barangay Poblacion Public Plaza', 'Poblacion', 'San Fernando', 'La Union', NULL, '16.61590000', '120.32090000', '2026-09-12 10:00:00');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (43, 'Catbangen Elementary Gate', 'Catbangen', 'San Fernando', 'La Union', NULL, '16.61200000', '120.31750000', '2026-09-12 10:00:00');
INSERT INTO `item_locations` (`location_id`, `address_line`, `barangay`, `municipality`, `province`, `postal_code`, `latitude`, `longitude`, `created_at`) VALUES (44, 'Sevilla Barangay Outpost', 'Sevilla', 'San Fernando', 'La Union', NULL, '16.60800000', '120.32500000', '2026-09-12 10:00:00');

DROP TABLE IF EXISTS `item_pickup_options`;
CREATE TABLE `item_pickup_options` (
  `pickup_option_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint unsigned NOT NULL,
  `option_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`pickup_option_id`),
  UNIQUE KEY `uq_item_pickup_options` (`item_id`,`option_name`),
  CONSTRAINT `fk_item_pickup_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `item_requests` (
  `request_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  `urgency_id` tinyint unsigned NOT NULL,
  `request_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `location_id` bigint unsigned NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `needed_before` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_item_requests_user` (`user_id`),
  KEY `idx_item_requests_category` (`category_id`),
  KEY `idx_item_requests_urgency` (`urgency_id`),
  KEY `idx_item_requests_status` (`request_status_id`),
  KEY `fk_item_requests_location` (`location_id`),
  CONSTRAINT `fk_item_requests_category` FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_requests_location` FOREIGN KEY (`location_id`) REFERENCES `item_locations` (`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_requests_status` FOREIGN KEY (`request_status_id`) REFERENCES `request_statuses` (`request_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_requests_urgency` FOREIGN KEY (`urgency_id`) REFERENCES `request_urgencies` (`urgency_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (12, 14, 2, 3, 1, 36, 'Durable Water-Resistant School Backpack', 'Looking for a sturdy backpack for an incoming Grade 7 student. Any dark or neutral color. Will be deeply appreciated.', '2026-09-25', '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (13, 14, 1, 2, 1, 37, 'Toddler & Children\'s Clothing (Ages 3-5)', 'Requesting gently used play clothes, t-shirts, and shorts for 4-year-old boy. Any clean hand-me-downs are welcome.', '2026-10-02', '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (14, 14, 7, 4, 1, 38, 'Pantry Relief Essentials & Rice Sack', 'Requesting a 5kg sack of rice and canned goods for a family recovering from recent typhoon flood in Barangay Poblacion.', '2026-09-18', '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (15, 21, 2, 3, 1, 43, 'Grade 11 STEM General Biology & Chemistry Reviewer', 'Seeking used Grade 11 science textbooks or printed modules for upcoming periodic examinations in San Fernando City.', '2026-09-30', '2026-09-12 10:00:00', '2026-09-12 10:00:00');
INSERT INTO `item_requests` (`request_id`, `user_id`, `category_id`, `urgency_id`, `request_status_id`, `location_id`, `title`, `description`, `needed_before`, `created_at`, `updated_at`) VALUES (16, 22, 3, 2, 3, 44, 'Foldable Study Desk & Ergonomic Study Chair', 'Looking for a small study table and chair for a college student attending hybrid classes. Successfully fulfilled by neighbor.', '2026-09-20', '2026-09-12 10:00:00', '2026-09-12 10:00:00');

DROP TABLE IF EXISTS `item_statuses`;
CREATE TABLE `item_statuses` (
  `item_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`item_status_id`),
  UNIQUE KEY `uq_item_statuses_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (1, 'available', 'Publicly discoverable and open for requests or exchange proposals');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (2, 'reserved', 'Currently held for an accepted exchange or pending pickup');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (3, 'exchanged', 'Successfully exchanged between community neighbors');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (4, 'donated', 'Successfully received by neighbor as a free donation');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (5, 'draft', 'Saved by owner but not yet published to the community');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (6, 'reported', 'Flagged by community members and hidden pending moderator review');
INSERT INTO `item_statuses` (`item_status_id`, `status_name`, `description`) VALUES (7, 'removed', 'Withdrawn by owner or removed by administrator');

DROP TABLE IF EXISTS `item_types`;
CREATE TABLE `item_types` (
  `item_type_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`item_type_id`),
  UNIQUE KEY `uq_item_types_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (1, 'donation', 'Free surplus item given to fellow neighbors in need');
INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (2, 'exchange', 'Item offered in exchange for another requested item');
INSERT INTO `item_types` (`item_type_id`, `type_name`, `description`) VALUES (3, 'request', 'Community request for an item needed by a neighbor');

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  `condition_id` tinyint unsigned NOT NULL,
  `item_type_id` tinyint unsigned NOT NULL,
  `item_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `location_id` bigint unsigned NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `availability` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Anytime',
  `views_count` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `idx_items_owner` (`owner_id`),
  KEY `idx_items_category` (`category_id`),
  KEY `idx_items_status` (`item_status_id`),
  KEY `idx_items_type` (`item_type_id`),
  KEY `idx_items_location` (`location_id`),
  KEY `fk_items_condition` (`condition_id`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_condition` FOREIGN KEY (`condition_id`) REFERENCES `item_conditions` (`condition_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_location` FOREIGN KEY (`location_id`) REFERENCES `item_locations` (`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_items_status` FOREIGN KEY (`item_status_id`) REFERENCES `item_statuses` (`item_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_type` FOREIGN KEY (`item_type_id`) REFERENCES `item_types` (`item_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (24, 14, 2, 1, 1, 1, 32, 'Elementary School Supplies Pack', 'Complete set containing 6 spiral notebooks, pad paper, 12-color crayons, ballpens, pencil case, and ruler for elementary students in need.', 2, 'Weekdays 4pm - 7pm, Barangay Poblacion Hall', 16, '2026-09-11 21:48:23', '2026-09-12 16:22:57');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (25, 14, 4, 3, 1, 1, 33, 'College Algebra & General Science Used Textbooks', 'Set of college and high school reviewer textbooks in good clean condition. No missing pages, slight highlighter marks. Free for any student.', 1, 'Any day after 2pm', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (26, 14, 1, 2, 1, 1, 34, 'Men\'s Clean Office & Casual Polo Shirts', '4 pieces of freshly laundered button-down polo shirts (Size Medium). Worn only a few times, perfect for job interviews or daily work.', 4, 'Weekends anytime', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (27, 14, 3, 3, 1, 1, 35, 'Stainless Steel Cooking Utensils & Frying Pan Set', 'Sturdy stainless steel ladle, spatula, tong, and 24cm non-stick frying pan. Downsizing kitchen items, fully functional and cleaned.', 1, 'Flexible schedule', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (28, 14, 2, 3, 3, 1, 36, 'Durable Water-Resistant School Backpack', 'Looking for a sturdy backpack for an incoming Grade 7 student. Any dark or neutral color. Will be deeply appreciated.', 1, 'Anytime', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (29, 14, 1, 3, 3, 1, 37, 'Toddler & Children\'s Clothing (Ages 3-5)', 'Requesting gently used play clothes, t-shirts, and shorts for 4-year-old boy. Any clean hand-me-downs are welcome.', 3, 'Flexible', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (30, 14, 7, 1, 3, 1, 38, 'Pantry Relief Essentials & Rice Sack', 'Requesting a 5kg sack of rice and canned goods for a family recovering from recent typhoon flood in Barangay Poblacion.', 1, 'Immediate / Urgent', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (31, 14, 4, 2, 2, 1, 39, 'Senior High Engineering Math Reviewer for Grade 10 Science Books', 'Offering SHS STEM calculus and physics review manuals. Looking to swap for Grade 10 science and math modules for my younger sibling.', 1, 'Weekdays after 5pm', 14, '2026-09-11 21:48:23', '2026-09-11 23:41:01');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (32, 14, 3, 3, 2, 1, 40, 'Electric Stand Fan for Induction Cooker or Rice Cooker', 'Standard 16-inch 3-speed desk/stand fan in 100% working condition. Looking to trade for a small rice cooker or single induction stove.', 1, 'Weekends', 14, '2026-09-11 21:48:23', '2026-09-11 23:40:41');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (33, 14, 1, 2, 2, 1, 41, 'Women\'s Denim Jacket (Medium) for School Uniform Blouses', 'Classic blue denim jacket in great condition. Want to exchange for 2 white high school uniform blouses (Size Medium or Large).', 1, 'Weekdays anytime', 12, '2026-09-11 21:48:23', '2026-09-11 21:48:23');
INSERT INTO `items` (`item_id`, `owner_id`, `category_id`, `condition_id`, `item_type_id`, `item_status_id`, `location_id`, `title`, `description`, `quantity`, `availability`, `views_count`, `created_at`, `updated_at`) VALUES (34, 14, 2, 1, 1, 1, 42, 'High School Scientific Calculator & Drafting Geometry Tools', 'Casio scientific calculator with transparent geometry ruler set and protractor for STEM / high school students in need of school tools.', 1, 'Anytime, Barangay Hall or pickup', 8, '2026-09-12 10:00:00', '2026-09-12 10:00:00');

DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE `message_reactions` (
  `reaction_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `reaction` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reaction_id`),
  UNIQUE KEY `uq_message_user_reaction` (`message_id`,`user_id`),
  KEY `fk_react_user` (`user_id`),
  CONSTRAINT `fk_react_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_react_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `message_types`;
CREATE TABLE `message_types` (
  `message_type_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`message_type_id`),
  UNIQUE KEY `uq_message_types_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (3, 'file');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (2, 'image');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (4, 'system');
INSERT INTO `message_types` (`message_type_id`, `type_name`) VALUES (1, 'text');

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `message_type_id` tinyint unsigned NOT NULL DEFAULT '1',
  `content` text COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_unsent` tinyint(1) NOT NULL DEFAULT '0',
  `unsent_at` datetime DEFAULT NULL,
  `is_edited` tinyint(1) NOT NULL DEFAULT '0',
  `edited_at` datetime DEFAULT NULL,
  `reply_to_message_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `idx_messages_conversation_date` (`conversation_id`,`created_at`),
  KEY `idx_messages_sender` (`sender_id`),
  KEY `fk_messages_type` (`message_type_id`),
  KEY `fk_reply_msg` (`reply_to_message_id`),
  CONSTRAINT `fk_messages_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_type` FOREIGN KEY (`message_type_id`) REFERENCES `message_types` (`message_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reply_msg` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`message_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `notification_types`;
CREATE TABLE `notification_types` (
  `notification_type_id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `type_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`notification_type_id`),
  UNIQUE KEY `uq_notification_types_code` (`type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `notifications` (
  `notification_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `notification_type_id` smallint unsigned NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_user_id` bigint unsigned DEFAULT NULL,
  `related_item_id` bigint unsigned DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`,`created_at`),
  KEY `fk_notifications_type` (`notification_type_id`),
  KEY `fk_notifications_rel_user` (`related_user_id`),
  KEY `fk_notifications_rel_item` (`related_item_id`),
  CONSTRAINT `fk_notifications_rel_item` FOREIGN KEY (`related_item_id`) REFERENCES `items` (`item_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_rel_user` FOREIGN KEY (`related_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_type` FOREIGN KEY (`notification_type_id`) REFERENCES `notification_types` (`notification_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (15, 5, 3, 'Exchange Proposal Accepted!', 'Your trade proposal has been accepted! You can now coordinate handover details.', '/exchanges', NULL, NULL, 1, '2026-09-07 16:12:23', '2026-09-07 16:00:06');
INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (20, 5, 7, 'Community Assistance Fulfilled!', 'Admin User offered support and your request "Request for: E2E Hand Tools Set" has been fulfilled!', '/requests', 5, NULL, 1, '2026-09-08 21:52:16', '2026-09-07 21:43:34');
INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type_id`, `title`, `message`, `link`, `related_user_id`, `related_item_id`, `is_read`, `read_at`, `created_at`) VALUES (25, 5, 7, 'Community Assistance Fulfilled!', 'Admin User offered support and your request "Request for: Children\'s Books" has been fulfilled!', '/requests', 5, NULL, 1, '2026-09-08 21:52:16', '2026-09-07 21:58:22');

DROP TABLE IF EXISTS `profile_picture_statuses`;
CREATE TABLE `profile_picture_statuses` (
  `status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `uq_profile_picture_statuses_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (1, 'pending', 'Avatar photo uploaded and awaiting administrator moderation');
INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (2, 'approved', 'Avatar approved and actively displayed across neighbor interactions');
INSERT INTO `profile_picture_statuses` (`status_id`, `status_code`, `description`) VALUES (3, 'rejected', 'Avatar rejected due to community guideline violations');

DROP TABLE IF EXISTS `profile_pictures`;
CREATE TABLE `profile_pictures` (
  `profile_picture_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `file_reference` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`profile_picture_id`),
  KEY `idx_profile_pictures_user` (`user_id`),
  KEY `idx_profile_pictures_status` (`status_id`),
  KEY `fk_profile_pictures_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_profile_pictures_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_profile_pictures_status` FOREIGN KEY (`status_id`) REFERENCES `profile_picture_statuses` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_profile_pictures_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `profile_pictures` (`profile_picture_id`, `user_id`, `file_reference`, `status_id`, `is_active`, `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`) VALUES (9, 14, 'data:image/jpeg;base64,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', 1, 1, NULL, '2026-09-06 01:26:45', NULL, NULL);

DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `profile_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `address_line` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barangay` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `municipality` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `uq_profiles_user_id` (`user_id`),
  UNIQUE KEY `uq_profiles_username` (`username`),
  KEY `idx_profiles_location` (`municipality`,`barangay`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (2, 5, 'admin', 'Admin', NULL, 'User', '09170000000', NULL, 'Municipal Hall', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-06 00:51:42', '2026-09-06 13:43:19');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (11, 14, 'jeho', 'Jehosue', NULL, 'Biscarra', '+639923314755', 'Community Member', 'Dangdangla', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-06 01:26:45', '2026-09-06 01:26:45');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (16, 19, 'student1', 'Student', NULL, '1', '09171110001', NULL, 'Community Center Area', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (17, 20, 'student2', 'Student', NULL, '2', '09171110002', NULL, 'Community Center Area', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (18, 21, 'juandelacruz', 'Juan', NULL, 'Dela Cruz', '09181234501', NULL, 'Community Center Area', 'Poblacion', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (19, 22, 'mariasantos', 'Maria', NULL, 'Santos', '09181234502', NULL, 'Community Center Area', 'Catbangen', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (20, 23, 'carlomendoza', 'Carlo', NULL, 'Mendoza', '09181234503', NULL, 'Community Center Area', 'Sevilla', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (21, 24, 'beareyes', 'Bea', NULL, 'Reyes', '09181234504', NULL, 'Community Center Area', 'Lingsat', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (22, 25, 'daniloramos', 'Danilo', NULL, 'Ramos', '09181234505', NULL, 'Community Center Area', 'Ilocanos Sur', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');
INSERT INTO `profiles` (`profile_id`, `user_id`, `username`, `first_name`, `middle_name`, `last_name`, `phone`, `bio`, `address_line`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (23, 26, 'elenatorres', 'Elena', NULL, 'Torres', '09181234506', NULL, 'Community Center Area', 'Carlatan', 'San Fernando', 'La Union', NULL, NULL, '2026-09-12 20:17:00', '2026-09-12 20:17:00');

DROP TABLE IF EXISTS `ratings`;
CREATE TABLE `ratings` (
  `rating_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exchange_id` bigint unsigned NOT NULL,
  `rater_id` bigint unsigned NOT NULL,
  `rated_user_id` bigint unsigned NOT NULL,
  `score` tinyint unsigned NOT NULL,
  `review` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `uq_ratings_exchange_pair` (`exchange_id`,`rater_id`,`rated_user_id`),
  KEY `idx_ratings_rated_user` (`rated_user_id`),
  KEY `fk_ratings_rater` (`rater_id`),
  CONSTRAINT `fk_ratings_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ratings_rated_user` FOREIGN KEY (`rated_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ratings_rater` FOREIGN KEY (`rater_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_ratings_score` CHECK ((`score` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `report_reasons`;
CREATE TABLE `report_reasons` (
  `reason_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `reason_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`reason_id`),
  UNIQUE KEY `uq_report_reasons_code` (`reason_code`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
CREATE TABLE `report_statuses` (
  `report_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`report_status_id`),
  UNIQUE KEY `uq_report_statuses_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (1, 'pending', 'Submitted and awaiting moderator investigation');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (2, 'reviewed', 'Under active review by administrator');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (3, 'resolved', 'Appropriate disciplinary or cleanup action taken');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (4, 'dismissed', 'Investigated and determined not to violate guidelines');
INSERT INTO `report_statuses` (`report_status_id`, `status_name`, `description`) VALUES (6, 'under_review', 'Report is currently being reviewed by an admin');

DROP TABLE IF EXISTS `report_target_types`;
CREATE TABLE `report_target_types` (
  `target_type_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`target_type_id`),
  UNIQUE KEY `uq_report_target_types_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (2, 'item');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (3, 'message');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (5, 'request');
INSERT INTO `report_target_types` (`target_type_id`, `type_name`) VALUES (1, 'user');

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `report_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reporter_id` bigint unsigned NOT NULL,
  `target_type_id` tinyint unsigned NOT NULL,
  `target_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_id` tinyint unsigned NOT NULL,
  `status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolved_by` bigint unsigned DEFAULT NULL,
  `resolution_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `idx_reports_status` (`status_id`),
  KEY `idx_reports_target` (`target_type_id`,`target_id`),
  KEY `fk_reports_reporter` (`reporter_id`),
  KEY `fk_reports_reason` (`reason_id`),
  KEY `fk_reports_resolver` (`resolved_by`),
  CONSTRAINT `fk_reports_reason` FOREIGN KEY (`reason_id`) REFERENCES `report_reasons` (`reason_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_status` FOREIGN KEY (`status_id`) REFERENCES `report_statuses` (`report_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_target_type` FOREIGN KEY (`target_type_id`) REFERENCES `report_target_types` (`target_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `request_images`;
CREATE TABLE `request_images` (
  `request_image_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `request_id` bigint unsigned NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_image_id`),
  KEY `idx_request_images_req` (`request_id`,`display_order`),
  CONSTRAINT `fk_request_images_request` FOREIGN KEY (`request_id`) REFERENCES `item_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (2, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (3, 13, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (4, 14, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 0, '2026-09-11 21:48:23');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (5, 15, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80', 0, '2026-09-12 10:00:00');
INSERT INTO `request_images` (`request_image_id`, `request_id`, `image_url`, `display_order`, `created_at`) VALUES (6, 16, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80', 0, '2026-09-12 10:00:00');

DROP TABLE IF EXISTS `request_statuses`;
CREATE TABLE `request_statuses` (
  `request_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`request_status_id`),
  UNIQUE KEY `uq_request_statuses_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (1, 'active', 'Actively seeking assistance from the neighborhood');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (2, 'in_progress', 'Neighbor has stepped forward to fulfill the request');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (3, 'completed', 'Request successfully fulfilled and closed');
INSERT INTO `request_statuses` (`request_status_id`, `status_name`, `description`) VALUES (4, 'cancelled', 'Closed by requester or expired');

DROP TABLE IF EXISTS `request_urgencies`;
CREATE TABLE `request_urgencies` (
  `urgency_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `urgency_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`urgency_id`),
  UNIQUE KEY `uq_request_urgencies_name` (`urgency_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (1, 'low', 1);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (2, 'medium', 2);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (3, 'high', 3);
INSERT INTO `request_urgencies` (`urgency_id`, `urgency_name`, `level`) VALUES (4, 'critical', 4);

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_roles_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (1, 'admin', 'System and barangay safety moderator with full verification privileges');
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (2, 'user', 'Standard verified community neighbor');
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (3, 'guest', 'Unverified visitor with browse-only capabilities');

DROP TABLE IF EXISTS `saved_items`;
CREATE TABLE `saved_items` (
  `user_id` bigint unsigned NOT NULL,
  `item_id` bigint unsigned NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`item_id`),
  KEY `fk_saved_items_item` (`item_id`),
  CONSTRAINT `fk_saved_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_saved_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE `user_badges` (
  `user_id` bigint unsigned NOT NULL,
  `badge_id` int unsigned NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`badge_id`),
  KEY `fk_user_badges_badge` (`badge_id`),
  CONSTRAINT `fk_user_badges_badge` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`badge_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` tinyint unsigned NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (5, 1, '2026-09-06 00:51:42');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (14, 2, '2026-09-06 01:26:45');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (19, 1, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (20, 1, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (21, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (22, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (23, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (24, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (25, 2, '2026-09-12 20:17:00');
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES (26, 2, '2026-09-12 20:17:00');

DROP TABLE IF EXISTS `user_suspensions`;
CREATE TABLE `user_suspensions` (
  `suspension_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `suspended_by` bigint unsigned NOT NULL,
  `start_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`suspension_id`),
  KEY `idx_user_suspensions_user` (`user_id`),
  KEY `idx_user_suspensions_status` (`status`),
  KEY `fk_user_suspensions_admin` (`suspended_by`),
  CONSTRAINT `fk_user_suspensions_admin` FOREIGN KEY (`suspended_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_suspensions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `is_suspended` tinyint(1) NOT NULL DEFAULT '0',
  `is_trusted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_active_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_account_status` (`account_status_id`),
  CONSTRAINT `fk_users_account_status` FOREIGN KEY (`account_status_id`) REFERENCES `account_statuses` (`account_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (5, 'admin@bayanihanhub.com', 'admin123', 2, 0, 1, '2026-09-06 00:51:42', '2026-09-15 21:27:45', '2026-09-15 13:27:46');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (14, 'jehosuebiscarra@gmail.com', 'password123', 2, 0, 1, '2026-09-06 01:26:45', '2026-09-12 16:23:26', '2026-09-12 16:23:27');
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (19, 'student1@bayanihanhub.com', 'student123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (20, 'student2@bayanihanhub.com', 'student123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (21, 'juan.delacruz@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (22, 'maria.santos@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (23, 'carlo.mendoza@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (24, 'bea.reyes@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (25, 'danilo.ramos@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `account_status_id`, `is_suspended`, `is_trusted`, `created_at`, `updated_at`, `last_active_at`) VALUES (26, 'elena.torres@bayanihanhub.com', 'password123', 2, 0, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00', NULL);

DROP TABLE IF EXISTS `verification_statuses`;
CREATE TABLE `verification_statuses` (
  `verification_status_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `status_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`verification_status_id`),
  UNIQUE KEY `uq_verification_statuses_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (1, 'PENDING', 'Submitted and awaiting administrator review');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (2, 'APPROVED', 'Reviewed and approved by authorized administrator');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (3, 'REJECTED', 'Declined by administrator');
INSERT INTO `verification_statuses` (`verification_status_id`, `status_code`, `description`) VALUES (4, 'RETRY_REQUIRED', 'Returned to user for clearer photo or corrected document details');

SET FOREIGN_KEY_CHECKS=1;
