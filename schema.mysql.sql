-- ============================================================================
-- FarmTrack India: Production MySQL 8.0+ Database Schema
-- Multi-Tenant Livestock Management System for Indian Dairy & Livestock Farms
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `farmtrack_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `farmtrack_db`;

-- 1. USERS TABLE
-- Stores farm owners, veterinarians, and herdsmen helpers
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `identifier` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Mobile number (+91...) or email address',
  `auth_type` ENUM('phone', 'email') NOT NULL DEFAULT 'phone',
  `phone` VARCHAR(25) NULL,
  `email` VARCHAR(150) NULL,
  `avatar` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. FARMS TABLE
-- Each farm is owned by an Admin User (Farm Boss)
CREATE TABLE IF NOT EXISTS `farms` (
  `id` VARCHAR(32) NOT NULL COMMENT 'Unique Farm Code e.g. FARM-7821',
  `name` VARCHAR(150) NOT NULL,
  `admin_user_id` VARCHAR(64) NOT NULL,
  `admin_name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(200) NOT NULL COMMENT 'e.g. Anand, Gujarat or Mandya, Karnataka',
  `total_acreage` DECIMAL(8,2) NOT NULL DEFAULT 5.0,
  `established_year` INT NOT NULL DEFAULT 2021,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. FARM CONFIGURATIONS TABLE
-- Admin settings for vaccine alerts, targets, and customization
CREATE TABLE IF NOT EXISTS `farm_configs` (
  `farm_id` VARCHAR(32) NOT NULL,
  `vaccine_alert_days` INT NOT NULL DEFAULT 7 COMMENT 'Days before due date to alert workers',
  `target_daily_milk_liters` DECIMAL(8,2) NOT NULL DEFAULT 40.0,
  `default_milk_unit` VARCHAR(20) NOT NULL DEFAULT 'Litres',
  `contact_phone` VARCHAR(25) NULL,
  `custom_vaccines_json` JSON NULL COMMENT 'Array of custom vaccine names added by admin',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`farm_id`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. FARM AVAILABLE SPECIES TABLE
-- What types of animals exist in this specific farm (Cow, Goat, Sheep, Chicken, Buffalo, etc.)
CREATE TABLE IF NOT EXISTS `farm_species` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `species_name` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_farm_species` (`farm_id`, `species_name`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. FARM MEMBERS TABLE
-- Approved team members with RBAC: Admin, Support Admin, Herdsman, Veterinarian, Field Staff
CREATE TABLE IF NOT EXISTS `farm_members` (
  `farm_id` VARCHAR(32) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `identifier` VARCHAR(150) NOT NULL,
  `role` ENUM('Admin', 'Support Admin', 'Herdsman', 'Veterinarian', 'Field Staff') NOT NULL DEFAULT 'Herdsman',
  `status` ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active',
  `joined_at` DATE NOT NULL,
  PRIMARY KEY (`farm_id`, `user_id`),
  INDEX `idx_farm_members_role` (`role`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. JOIN REQUESTS TABLE
-- Workers applying to join a farm; must be approved by the Farm Boss (Admin)
CREATE TABLE IF NOT EXISTS `join_requests` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `user_identifier` VARCHAR(150) NOT NULL,
  `message` TEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `requested_at` DATE NOT NULL,
  `reviewed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_join_requests_status` (`farm_id`, `status`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ANIMALS TABLE (LIVESTOCK INVENTORY)
CREATE TABLE IF NOT EXISTS `animals` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `tag_id` VARCHAR(64) NOT NULL COMMENT 'Ear Tag ID e.g. COW-001',
  `name` VARCHAR(100) NOT NULL,
  `species` VARCHAR(64) NOT NULL,
  `breed` VARCHAR(100) NOT NULL,
  `sex` ENUM('Female', 'Male') NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `photo_url` TEXT NULL,
  `paddock_location` VARCHAR(100) NOT NULL DEFAULT 'Barn A',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `health_status` VARCHAR(50) NOT NULL DEFAULT 'Healthy & Fit',
  `milk_status` VARCHAR(50) NOT NULL DEFAULT 'Giving Milk',
  `daily_milk_litres` DECIMAL(6,2) NULL,
  `sire_id` VARCHAR(64) NULL,
  `sire_name` VARCHAR(100) NULL,
  `sire_tag` VARCHAR(64) NULL,
  `sire_breed` VARCHAR(100) NULL,
  `dam_id` VARCHAR(64) NULL,
  `dam_name` VARCHAR(100) NULL,
  `dam_tag` VARCHAR(64) NULL,
  `dam_breed` VARCHAR(100) NULL,
  `birth_weight_kg` DECIMAL(6,2) NOT NULL DEFAULT 25.0,
  `current_weight_kg` DECIMAL(6,2) NOT NULL DEFAULT 350.0,
  `target_mature_weight_kg` DECIMAL(6,2) NOT NULL DEFAULT 420.0,
  `productivity_label` VARCHAR(100) NOT NULL DEFAULT 'Daily Milk',
  `current_productivity_value` VARCHAR(100) NOT NULL DEFAULT '15 Litres / day',
  `created_by` VARCHAR(64) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_farm_animal_tag` (`farm_id`, `tag_id`),
  INDEX `idx_animals_species` (`farm_id`, `species`),
  INDEX `idx_animals_health` (`farm_id`, `health_status`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. VACCINATIONS TABLE
-- Only Admin and Support Admin can insert, update, or delete records in this table
CREATE TABLE IF NOT EXISTS `vaccinations` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `animal_id` VARCHAR(64) NOT NULL,
  `vaccine_name` VARCHAR(150) NOT NULL,
  `disease_target` VARCHAR(150) NOT NULL,
  `due_date` DATE NOT NULL,
  `administered_date` DATE NULL,
  `status` ENUM('Completed', 'Due Soon', 'Overdue', 'Scheduled') NOT NULL DEFAULT 'Scheduled',
  `dosage` VARCHAR(100) NOT NULL,
  `batch_number` VARCHAR(100) NOT NULL,
  `administered_by` VARCHAR(150) NULL,
  `next_booster_date` DATE NULL,
  `notes` TEXT NULL,
  `created_by` VARCHAR(64) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_vaccine_due` (`farm_id`, `due_date`, `status`),
  INDEX `idx_vaccine_animal` (`animal_id`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MILK YIELD LOGS TABLE
-- Daily milk logs for cows/goats with Morning & Evening sessions
CREATE TABLE IF NOT EXISTS `milk_yield_logs` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `animal_id` VARCHAR(64) NOT NULL,
  `cow_tag` VARCHAR(64) NOT NULL,
  `cow_name` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `session` ENUM('Morning', 'Evening', 'Afternoon') NOT NULL,
  `liters` DECIMAL(6,2) NOT NULL,
  `fat_percentage` DECIMAL(4,2) NULL,
  `recorded_by` VARCHAR(150) NOT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_milk_logs_date` (`farm_id`, `date`),
  INDEX `idx_milk_logs_animal` (`animal_id`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. GROWTH METRICS TABLE
CREATE TABLE IF NOT EXISTS `growth_metrics` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `animal_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `weight_kg` DECIMAL(6,2) NOT NULL,
  `height_cm` DECIMAL(6,2) NOT NULL DEFAULT 120.0,
  `body_condition_score` DECIMAL(3,1) NOT NULL DEFAULT 3.5,
  `average_daily_gain_g` INT NOT NULL DEFAULT 100,
  `daily_yield_value` DECIMAL(6,2) NOT NULL DEFAULT 0.0,
  `daily_yield_unit` VARCHAR(30) NOT NULL DEFAULT 'Litres/day',
  `recorded_by` VARCHAR(150) NOT NULL,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_growth_animal` (`animal_id`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS `health_records` (
  `id` VARCHAR(64) NOT NULL,
  `farm_id` VARCHAR(32) NOT NULL,
  `animal_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `type` VARCHAR(80) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `diagnosis` TEXT NOT NULL,
  `treatment_given` TEXT NOT NULL,
  `temperature_c` DECIMAL(4,1) NOT NULL DEFAULT 38.5,
  `veterinarian` VARCHAR(150) NOT NULL,
  `outcome` VARCHAR(50) NOT NULL DEFAULT 'Cleared',
  `cost_inr` DECIMAL(8,2) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`id`),
  INDEX `idx_health_animal` (`animal_id`),
  FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
