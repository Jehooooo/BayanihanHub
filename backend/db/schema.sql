-- ========================================================================
-- Bayanihan Hub â€” Complete Normalized Relational Database Architecture (3NF)
-- Engine: MySQL (InnoDB)
-- Character Set: utf8mb4 (utf8mb4_unicode_ci)
-- Notice: AI Assistant tables are strictly excluded per project requirements.
-- ========================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------
-- DOMAIN 1: AUTHENTICATION, AUTHORIZATION & ROLES (LOOKUP & CORE)
-- ------------------------------------------------------------------------

DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `user_badges`;
DROP TABLE IF EXISTS `saved_items`;
DROP TABLE IF EXISTS `item_images`;
DROP TABLE IF EXISTS `item_pickup_options`;
DROP TABLE IF EXISTS `request_images`;
DROP TABLE IF EXISTS `exchange_items`;
DROP TABLE IF EXISTS `exchange_participants`;
DROP TABLE IF EXISTS `exchange_history`;
DROP TABLE IF EXISTS `conversation_participants`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `identity_verifications`;
DROP TABLE IF EXISTS `profile_pictures`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `exchanges`;
DROP TABLE IF EXISTS `item_requests`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `users`;

DROP TABLE IF EXISTS `account_statuses`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `profile_picture_statuses`;
DROP TABLE IF EXISTS `badges`;
DROP TABLE IF EXISTS `id_types`;
DROP TABLE IF EXISTS `facial_verification_statuses`;
DROP TABLE IF EXISTS `verification_statuses`;
DROP TABLE IF EXISTS `item_categories`;
DROP TABLE IF EXISTS `item_conditions`;
DROP TABLE IF EXISTS `item_types`;
DROP TABLE IF EXISTS `item_statuses`;
DROP TABLE IF EXISTS `item_locations`;
DROP TABLE IF EXISTS `request_urgencies`;
DROP TABLE IF EXISTS `request_statuses`;
DROP TABLE IF EXISTS `exchange_statuses`;
DROP TABLE IF EXISTS `message_types`;
DROP TABLE IF EXISTS `notification_types`;
DROP TABLE IF EXISTS `report_reasons`;
DROP TABLE IF EXISTS `report_statuses`;
DROP TABLE IF EXISTS `report_target_types`;
DROP TABLE IF EXISTS `audit_actions`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Account Statuses (Lookup)
CREATE TABLE IF NOT EXISTS `account_statuses` (
    `account_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_code` VARCHAR(32) NOT NULL,
    `display_name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`account_status_id`),
    UNIQUE KEY `uq_account_statuses_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Roles (Lookup)
CREATE TABLE IF NOT EXISTS `roles` (
    `role_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `uq_roles_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Profile Picture Statuses (Lookup)
CREATE TABLE IF NOT EXISTS `profile_picture_statuses` (
    `status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_code` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`status_id`),
    UNIQUE KEY `uq_profile_picture_statuses_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Community Badges (Lookup)
CREATE TABLE IF NOT EXISTS `badges` (
    `badge_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `badge_code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`badge_id`),
    UNIQUE KEY `uq_badges_code` (`badge_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Philippine ID Types (Lookup)
CREATE TABLE IF NOT EXISTS `id_types` (
    `id_type_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(120) NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `number_label` VARCHAR(100) NOT NULL,
    `format_placeholder` VARCHAR(64) NOT NULL,
    `format_hint` VARCHAR(150) NOT NULL,
    `requires_expiration` BOOLEAN NOT NULL DEFAULT TRUE,
    `extra_field_label` VARCHAR(100) NULL,
    `extra_field_placeholder` VARCHAR(100) NULL,
    `help_text` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id_type_id`),
    UNIQUE KEY `uq_id_types_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Facial Verification Statuses (Lookup)
CREATE TABLE IF NOT EXISTS `facial_verification_statuses` (
    `status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_code` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`status_id`),
    UNIQUE KEY `uq_facial_verification_statuses_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Verification Statuses (Lookup)
CREATE TABLE IF NOT EXISTS `verification_statuses` (
    `verification_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_code` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`verification_status_id`),
    UNIQUE KEY `uq_verification_statuses_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Item Categories (Lookup)
CREATE TABLE IF NOT EXISTS `item_categories` (
    `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`category_id`),
    UNIQUE KEY `uq_item_categories_slug` (`slug`),
    UNIQUE KEY `uq_item_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Item Conditions (Lookup)
CREATE TABLE IF NOT EXISTS `item_conditions` (
    `condition_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `condition_name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`condition_id`),
    UNIQUE KEY `uq_item_conditions_name` (`condition_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Item Types (Lookup: donation, exchange, request)
CREATE TABLE IF NOT EXISTS `item_types` (
    `item_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`item_type_id`),
    UNIQUE KEY `uq_item_types_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Item Statuses (Lookup: available, reserved, exchanged, donated, draft, reported, removed)
CREATE TABLE IF NOT EXISTS `item_statuses` (
    `item_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`item_status_id`),
    UNIQUE KEY `uq_item_statuses_name` (`status_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Item Geographic Locations
CREATE TABLE IF NOT EXISTS `item_locations` (
    `location_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `address_line` VARCHAR(255) NOT NULL,
    `barangay` VARCHAR(100) NOT NULL,
    `municipality` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`location_id`),
    INDEX `idx_item_locations_geo` (`municipality`, `barangay`),
    INDEX `idx_item_locations_lat_lng` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Request Urgencies (Lookup: low, medium, high, critical)
CREATE TABLE IF NOT EXISTS `request_urgencies` (
    `urgency_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `urgency_name` VARCHAR(32) NOT NULL,
    `level` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`urgency_id`),
    UNIQUE KEY `uq_request_urgencies_name` (`urgency_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Request Statuses (Lookup: active, in_progress, completed, cancelled)
CREATE TABLE IF NOT EXISTS `request_statuses` (
    `request_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`request_status_id`),
    UNIQUE KEY `uq_request_statuses_name` (`status_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Exchange Statuses (Lookup: pending, accepted, meeting_scheduled, completed, cancelled, rejected)
CREATE TABLE IF NOT EXISTS `exchange_statuses` (
    `exchange_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`exchange_status_id`),
    UNIQUE KEY `uq_exchange_statuses_name` (`status_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Message Types (Lookup: text, image, file, system)
CREATE TABLE IF NOT EXISTS `message_types` (
    `message_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`message_type_id`),
    UNIQUE KEY `uq_message_types_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Notification Types (Lookup)
CREATE TABLE IF NOT EXISTS `notification_types` (
    `notification_type_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_code` VARCHAR(64) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`notification_type_id`),
    UNIQUE KEY `uq_notification_types_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Report Reasons (Lookup: inappropriate, spam, scam, offensive, duplicate, other)
CREATE TABLE IF NOT EXISTS `report_reasons` (
    `reason_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `reason_code` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`reason_id`),
    UNIQUE KEY `uq_report_reasons_code` (`reason_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Report Statuses (Lookup: pending, reviewed, resolved, dismissed)
CREATE TABLE IF NOT EXISTS `report_statuses` (
    `report_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `status_name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`report_status_id`),
    UNIQUE KEY `uq_report_statuses_name` (`status_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Report Target Types (Lookup: user, item, message)
CREATE TABLE IF NOT EXISTS `report_target_types` (
    `target_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`target_type_id`),
    UNIQUE KEY `uq_report_target_types_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Audit Action Catalog (Lookup)
CREATE TABLE IF NOT EXISTS `audit_actions` (
    `action_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `action_name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`action_id`),
    UNIQUE KEY `uq_audit_actions_name` (`action_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 2: CORE USERS & PROFILES
-- ------------------------------------------------------------------------

-- 22. Users (Core Entity)
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `account_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- Default to PENDING
    `is_suspended` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_trusted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_active_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_email` (`email`),
    INDEX `idx_users_account_status` (`account_status_id`),
    CONSTRAINT `fk_users_account_status` FOREIGN KEY (`account_status_id`)
        REFERENCES `account_statuses` (`account_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. User Roles (M:N Junction Table)
CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` TINYINT UNSIGNED NOT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`)
        REFERENCES `roles` (`role_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. User Profiles (1:1 with users)
CREATE TABLE IF NOT EXISTS `profiles` (
    `profile_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `username` VARCHAR(64) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(32) NOT NULL,
    `bio` TEXT NULL,
    `address_line` VARCHAR(255) NOT NULL,
    `barangay` VARCHAR(100) NOT NULL,
    `municipality` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`profile_id`),
    UNIQUE KEY `uq_profiles_user_id` (`user_id`),
    UNIQUE KEY `uq_profiles_username` (`username`),
    INDEX `idx_profiles_location` (`municipality`, `barangay`),
    CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. User Badges (M:N Junction Table)
CREATE TABLE IF NOT EXISTS `user_badges` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `badge_id` INT UNSIGNED NOT NULL,
    `earned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `badge_id`),
    CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_badges_badge` FOREIGN KEY (`badge_id`)
        REFERENCES `badges` (`badge_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Profile Picture Submissions (History & Moderation)
CREATE TABLE IF NOT EXISTS `profile_pictures` (
    `profile_picture_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `file_reference` VARCHAR(500) NOT NULL,
    `status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- Default to pending
    `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
    `rejection_reason` VARCHAR(255) NULL,
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
    `reviewed_by` BIGINT UNSIGNED NULL,
    PRIMARY KEY (`profile_picture_id`),
    INDEX `idx_profile_pictures_user` (`user_id`),
    INDEX `idx_profile_pictures_status` (`status_id`),
    CONSTRAINT `fk_profile_pictures_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_profile_pictures_status` FOREIGN KEY (`status_id`)
        REFERENCES `profile_picture_statuses` (`status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_profile_pictures_reviewer` FOREIGN KEY (`reviewed_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 3: IDENTITY & FACIAL VERIFICATION (ADMIN APPROVAL)
-- ------------------------------------------------------------------------

-- 27. Identity Verifications
CREATE TABLE IF NOT EXISTS `identity_verifications` (
    `identity_verification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `id_type_id` SMALLINT UNSIGNED NOT NULL,
    `id_number` VARCHAR(120) NOT NULL,
    `masked_id_number` VARCHAR(64) NOT NULL,
    `full_name_on_id` VARCHAR(200) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `expiration_date` DATE NULL,
    `extra_info` VARCHAR(255) NULL,
    `document_reference` VARCHAR(500) NOT NULL,
    `facial_selfie_reference` VARCHAR(500) NOT NULL,
    `facial_verification_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- NOT_STARTED / PASSED
    `verification_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1,        -- PENDING / APPROVED
    `confidence_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `provider` VARCHAR(64) NOT NULL DEFAULT 'BayanihanHub-Biometric-Engine',
    `rejection_reason` TEXT NULL,
    `retry_instructions` TEXT NULL,
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
    `reviewed_by` BIGINT UNSIGNED NULL,
    PRIMARY KEY (`identity_verification_id`),
    INDEX `idx_identity_verifications_user` (`user_id`),
    INDEX `idx_identity_verifications_status` (`verification_status_id`),
    CONSTRAINT `fk_identity_verif_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_identity_verif_id_type` FOREIGN KEY (`id_type_id`)
        REFERENCES `id_types` (`id_type_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_identity_verif_face_status` FOREIGN KEY (`facial_verification_status_id`)
        REFERENCES `facial_verification_statuses` (`status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_identity_verif_verif_status` FOREIGN KEY (`verification_status_id`)
        REFERENCES `verification_statuses` (`verification_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_identity_verif_reviewer` FOREIGN KEY (`reviewed_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 4: ITEMS, GALLERIES, LOCATIONS & FAVORITES
-- ------------------------------------------------------------------------

-- 28. Items
CREATE TABLE IF NOT EXISTS `items` (
    `item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `owner_id` BIGINT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED NOT NULL,
    `condition_id` TINYINT UNSIGNED NOT NULL,
    `item_type_id` TINYINT UNSIGNED NOT NULL,
    `item_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- available
    `location_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `availability` VARCHAR(100) NOT NULL DEFAULT 'Anytime',
    `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`item_id`),
    INDEX `idx_items_owner` (`owner_id`),
    INDEX `idx_items_category` (`category_id`),
    INDEX `idx_items_status` (`item_status_id`),
    INDEX `idx_items_type` (`item_type_id`),
    INDEX `idx_items_location` (`location_id`),
    CONSTRAINT `fk_items_owner` FOREIGN KEY (`owner_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`)
        REFERENCES `item_categories` (`category_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_items_condition` FOREIGN KEY (`condition_id`)
        REFERENCES `item_conditions` (`condition_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_items_type` FOREIGN KEY (`item_type_id`)
        REFERENCES `item_types` (`item_type_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_items_status` FOREIGN KEY (`item_status_id`)
        REFERENCES `item_statuses` (`item_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_items_location` FOREIGN KEY (`location_id`)
        REFERENCES `item_locations` (`location_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Item Images (1:M gallery)
CREATE TABLE IF NOT EXISTS `item_images` (
    `item_image_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`item_image_id`),
    INDEX `idx_item_images_item` (`item_id`, `display_order`),
    CONSTRAINT `fk_item_images_item` FOREIGN KEY (`item_id`)
        REFERENCES `items` (`item_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. Item Pickup Options
CREATE TABLE IF NOT EXISTS `item_pickup_options` (
    `pickup_option_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `option_name` VARCHAR(50) NOT NULL, -- Meet up, Delivery, Pickup
    PRIMARY KEY (`pickup_option_id`),
    UNIQUE KEY `uq_item_pickup_options` (`item_id`, `option_name`),
    CONSTRAINT `fk_item_pickup_item` FOREIGN KEY (`item_id`)
        REFERENCES `items` (`item_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Saved Items (M:N Junction Table)
CREATE TABLE IF NOT EXISTS `saved_items` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `saved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `item_id`),
    CONSTRAINT `fk_saved_items_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_saved_items_item` FOREIGN KEY (`item_id`)
        REFERENCES `items` (`item_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 5: COMMUNITY REQUESTS
-- ------------------------------------------------------------------------

-- 32. Item Requests
CREATE TABLE IF NOT EXISTS `item_requests` (
    `request_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED NOT NULL,
    `urgency_id` TINYINT UNSIGNED NOT NULL,
    `request_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- active
    `location_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `needed_before` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`request_id`),
    INDEX `idx_item_requests_user` (`user_id`),
    INDEX `idx_item_requests_category` (`category_id`),
    INDEX `idx_item_requests_urgency` (`urgency_id`),
    INDEX `idx_item_requests_status` (`request_status_id`),
    CONSTRAINT `fk_item_requests_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_item_requests_category` FOREIGN KEY (`category_id`)
        REFERENCES `item_categories` (`category_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_item_requests_urgency` FOREIGN KEY (`urgency_id`)
        REFERENCES `request_urgencies` (`urgency_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_item_requests_status` FOREIGN KEY (`request_status_id`)
        REFERENCES `request_statuses` (`request_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_item_requests_location` FOREIGN KEY (`location_id`)
        REFERENCES `item_locations` (`location_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. Request Images (1:M gallery)
CREATE TABLE IF NOT EXISTS `request_images` (
    `request_image_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `request_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`request_image_id`),
    INDEX `idx_request_images_req` (`request_id`, `display_order`),
    CONSTRAINT `fk_request_images_request` FOREIGN KEY (`request_id`)
        REFERENCES `item_requests` (`request_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 6: EXCHANGES & TRANSACTIONS
-- ------------------------------------------------------------------------

-- 34. Exchanges
CREATE TABLE IF NOT EXISTS `exchanges` (
    `exchange_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exchange_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- pending
    `meeting_date` DATETIME NULL,
    `meeting_location` VARCHAR(255) NULL,
    `message` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`exchange_id`),
    INDEX `idx_exchanges_status` (`exchange_status_id`),
    CONSTRAINT `fk_exchanges_status` FOREIGN KEY (`exchange_status_id`)
        REFERENCES `exchange_statuses` (`exchange_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. Exchange Participants (M:N)
CREATE TABLE IF NOT EXISTS `exchange_participants` (
    `exchange_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `participant_role` ENUM('offerer', 'receiver') NOT NULL,
    `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`exchange_id`, `user_id`),
    CONSTRAINT `fk_exchange_part_exchange` FOREIGN KEY (`exchange_id`)
        REFERENCES `exchanges` (`exchange_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_exchange_part_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. Exchange Items (M:N items mapped to exchange and contributor)
CREATE TABLE IF NOT EXISTS `exchange_items` (
    `exchange_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exchange_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `offered_by_user_id` BIGINT UNSIGNED NOT NULL,
    `role` ENUM('offered', 'requested') NOT NULL,
    PRIMARY KEY (`exchange_item_id`),
    UNIQUE KEY `uq_exchange_items_pair` (`exchange_id`, `item_id`),
    INDEX `idx_exchange_items_user` (`offered_by_user_id`),
    CONSTRAINT `fk_exchange_items_exchange` FOREIGN KEY (`exchange_id`)
        REFERENCES `exchanges` (`exchange_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_exchange_items_item` FOREIGN KEY (`item_id`)
        REFERENCES `items` (`item_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_exchange_items_user` FOREIGN KEY (`offered_by_user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. Exchange History (Audit Trail)
CREATE TABLE IF NOT EXISTS `exchange_history` (
    `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exchange_id` BIGINT UNSIGNED NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `performed_by` BIGINT UNSIGNED NOT NULL,
    `details` TEXT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`history_id`),
    INDEX `idx_exchange_history_exchange` (`exchange_id`),
    CONSTRAINT `fk_exchange_hist_exchange` FOREIGN KEY (`exchange_id`)
        REFERENCES `exchanges` (`exchange_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_exchange_hist_user` FOREIGN KEY (`performed_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 7: MESSAGING & CONVERSATIONS
-- ------------------------------------------------------------------------

-- 38. Conversations
CREATE TABLE IF NOT EXISTS `conversations` (
    `conversation_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. Conversation Participants (M:N)
CREATE TABLE IF NOT EXISTS `conversation_participants` (
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_read_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`conversation_id`, `user_id`),
    CONSTRAINT `fk_conv_part_conv` FOREIGN KEY (`conversation_id`)
        REFERENCES `conversations` (`conversation_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_conv_part_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40. Messages
CREATE TABLE IF NOT EXISTS `messages` (
    `message_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `message_type_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- text
    `content` TEXT NOT NULL,
    `file_url` VARCHAR(500) NULL,
    `file_name` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`message_id`),
    INDEX `idx_messages_conversation_date` (`conversation_id`, `created_at`),
    INDEX `idx_messages_sender` (`sender_id`),
    CONSTRAINT `fk_messages_conv` FOREIGN KEY (`conversation_id`)
        REFERENCES `conversations` (`conversation_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_messages_type` FOREIGN KEY (`message_type_id`)
        REFERENCES `message_types` (`message_type_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 8: NOTIFICATIONS
-- ------------------------------------------------------------------------

-- 41. Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
    `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `notification_type_id` SMALLINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(255) NULL,
    `related_user_id` BIGINT UNSIGNED NULL,
    `related_item_id` BIGINT UNSIGNED NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`notification_id`),
    INDEX `idx_notifications_user_read` (`user_id`, `is_read`, `created_at`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_notifications_type` FOREIGN KEY (`notification_type_id`)
        REFERENCES `notification_types` (`notification_type_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_notifications_rel_user` FOREIGN KEY (`related_user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_notifications_rel_item` FOREIGN KEY (`related_item_id`)
        REFERENCES `items` (`item_id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 9: RATINGS & REVIEWS
-- ------------------------------------------------------------------------

-- 42. Ratings
CREATE TABLE IF NOT EXISTS `ratings` (
    `rating_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exchange_id` BIGINT UNSIGNED NOT NULL,
    `rater_id` BIGINT UNSIGNED NOT NULL,
    `rated_user_id` BIGINT UNSIGNED NOT NULL,
    `score` TINYINT UNSIGNED NOT NULL,
    `review` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`rating_id`),
    UNIQUE KEY `uq_ratings_exchange_pair` (`exchange_id`, `rater_id`, `rated_user_id`),
    INDEX `idx_ratings_rated_user` (`rated_user_id`),
    CONSTRAINT `chk_ratings_score` CHECK (`score` BETWEEN 1 AND 5),
    CONSTRAINT `fk_ratings_exchange` FOREIGN KEY (`exchange_id`)
        REFERENCES `exchanges` (`exchange_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ratings_rater` FOREIGN KEY (`rater_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ratings_rated_user` FOREIGN KEY (`rated_user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- DOMAIN 10: REPORTS & AUDIT LOGS
-- ------------------------------------------------------------------------

-- 43. Reports
CREATE TABLE IF NOT EXISTS `reports` (
    `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `reporter_id` BIGINT UNSIGNED NOT NULL,
    `target_type_id` TINYINT UNSIGNED NOT NULL,
    `target_id` VARCHAR(100) NOT NULL,
    `reason_id` TINYINT UNSIGNED NOT NULL,
    `status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1, -- pending
    `description` TEXT NOT NULL,
    `resolved_by` BIGINT UNSIGNED NULL,
    `resolution_note` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`report_id`),
    INDEX `idx_reports_status` (`status_id`),
    INDEX `idx_reports_target` (`target_type_id`, `target_id`),
    CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reports_target_type` FOREIGN KEY (`target_type_id`)
        REFERENCES `report_target_types` (`target_type_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reports_reason` FOREIGN KEY (`reason_id`)
        REFERENCES `report_reasons` (`reason_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reports_status` FOREIGN KEY (`status_id`)
        REFERENCES `report_statuses` (`report_status_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 44. Administrative Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `audit_log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_id` BIGINT UNSIGNED NOT NULL,
    `action_id` SMALLINT UNSIGNED NOT NULL,
    `target_entity_type` VARCHAR(64) NOT NULL,
    `target_entity_id` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`audit_log_id`),
    INDEX `idx_audit_logs_admin` (`admin_id`),
    INDEX `idx_audit_logs_action` (`action_id`),
    INDEX `idx_audit_logs_entity` (`target_entity_type`, `target_entity_id`),
    CONSTRAINT `fk_audit_logs_admin` FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_audit_logs_action` FOREIGN KEY (`action_id`)
        REFERENCES `audit_actions` (`action_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
