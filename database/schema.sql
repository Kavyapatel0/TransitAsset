-- TransitAsset Database Schema
-- Version: 1.0.0
-- Description: Complete schema for public transport infrastructure asset lifecycle management

CREATE DATABASE IF NOT EXISTS transitasset CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transitasset;

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  manager_id INT UNSIGNED NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  type ENUM('DEPOT','WORKSHOP','CHARGING_STATION','OFFICE','WAREHOUSE','TERMINAL','FUEL_STATION','STORAGE','OTHER') NOT NULL DEFAULT 'DEPOT',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  contact_number VARCHAR(20),
  manager_id INT UNSIGNED NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NULL,
  location_id INT UNSIGNED NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_users_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Add manager FKs after users table is created
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE locations ADD CONSTRAINT fk_locations_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- ASSET CATEGORIES (reference table for extensibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS asset_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ASSET TYPES (reference table for extensibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS asset_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cat_type (category_id, name),
  CONSTRAINT fk_asset_types_category FOREIGN KEY (category_id) REFERENCES asset_categories(id)
);

-- ============================================================
-- ASSETS (core table)
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  registration_number VARCHAR(100),
  manufacturer VARCHAR(150),
  model VARCHAR(150),
  purchase_date DATE,
  purchase_cost DECIMAL(14,2),
  warranty_start DATE,
  warranty_expiry DATE,
  ownership_type ENUM('GOVERNMENT_OWNED','PRIVATE','PPP','LEASED') NOT NULL DEFAULT 'GOVERNMENT_OWNED',
  location_id INT UNSIGNED NULL,
  department_id INT UNSIGNED NULL,
  custodian_id INT UNSIGNED NULL,
  status ENUM('PROCURED','REGISTERED','ASSIGNED','OPERATIONAL','UNDER_INSPECTION','UNDER_MAINTENANCE','TRANSFERRED','RETIRED') NOT NULL DEFAULT 'PROCURED',
  `condition` ENUM('EXCELLENT','GOOD','FAIR','POOR','CRITICAL') NOT NULL DEFAULT 'GOOD',
  -- Vehicle-specific fields (nullable)
  fuel_type ENUM('DIESEL','CNG','ELECTRIC','HYBRID','PETROL') NULL,
  seating_capacity INT UNSIGNED NULL,
  mileage DECIMAL(10,2) NULL,
  battery_capacity DECIMAL(10,2) NULL,
  vehicle_number VARCHAR(50) NULL,
  -- Tracking dates
  last_inspection_date DATE NULL,
  next_inspection_date DATE NULL,
  last_maintenance_date DATE NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assets_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_assets_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_assets_custodian FOREIGN KEY (custodian_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ASSET LIFECYCLE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS asset_lifecycle (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  location_id INT UNSIGNED NULL,
  performed_by INT UNSIGNED NULL,
  reason TEXT,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lifecycle_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_lifecycle_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_lifecycle_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- INSPECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS inspections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NOT NULL,
  inspector_id INT UNSIGNED NULL,
  inspection_date DATE NOT NULL,
  result ENUM('PASS','FAIL','REQUIRES_ATTENTION') NOT NULL DEFAULT 'PASS',
  `condition` ENUM('EXCELLENT','GOOD','FAIR','POOR','CRITICAL') NOT NULL DEFAULT 'GOOD',
  findings TEXT,
  recommendations TEXT,
  next_inspection_date DATE,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspections_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_inspections_inspector FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NOT NULL,
  reported_by INT UNSIGNED NULL,
  assigned_technician INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('OPEN','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  diagnosis TEXT,
  resolution TEXT,
  maintenance_cost DECIMAL(12,2) NULL,
  parts_used TEXT,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_maint_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_maint_reporter FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_maint_technician FOREIGN KEY (assigned_technician) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ASSET TRANSFERS
-- ============================================================
CREATE TABLE IF NOT EXISTS asset_transfers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NOT NULL,
  from_location_id INT UNSIGNED NULL,
  to_location_id INT UNSIGNED NULL,
  requested_by INT UNSIGNED NULL,
  approved_by INT UNSIGNED NULL,
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transfer_date TIMESTAMP NULL,
  reason TEXT,
  status ENUM('REQUESTED','APPROVED','IN_TRANSIT','COMPLETED','REJECTED') NOT NULL DEFAULT 'REQUESTED',
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transfer_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_to FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_requester FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NOT NULL,
  document_type ENUM('PURCHASE','WARRANTY','INSPECTION','SERVICE','INSURANCE','OTHER') NOT NULL DEFAULT 'OTHER',
  document_name VARCHAR(255) NOT NULL,
  document_url VARCHAR(500),
  uploaded_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id INT UNSIGNED NULL,
  alert_type VARCHAR(100) NOT NULL,
  severity ENUM('INFO','WARNING','HIGH','CRITICAL') NOT NULL DEFAULT 'INFO',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerts_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT UNSIGNED NULL,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- REFRESH TOKENS (optional, for extended session support)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
