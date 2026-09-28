# TransitAsset — Database Schema Documentation

## Overview

TransitAsset uses **MySQL** as its relational database management system.

The schema is designed with:
- **Normalization** to eliminate redundancy
- **Foreign key constraints** for referential integrity
- **Indexes** for query performance
- **Timestamps** for audit trail
- **Transaction support** for data consistency

---

## Entity Relationship Diagram

```text
┌──────────┐         ┌────────────┐         ┌──────────┐
│  roles   │────────<│   users    │>────────│departments│
└──────────┘         └─────┬──────┘         └──────────┘
                           │
                           │ created_by
                           │ assigned_to
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ maintenance  │   │ inspections  │   │asset_transfers│
│  _requests   │   │              │   │              │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          │ asset_id
                          │
                   ┌──────▼───────┐
                   │    assets    │
                   └──────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│asset_lifecycle│  │  documents   │  │   alerts     │
└──────────────┘  └──────────────┘  └──────────────┘


┌────────────┐
│ locations  │◀─── assets.current_location_id
└────────────┘
                          
┌────────────┐
│ audit_logs │
└────────────┘
```

---

## Database Tables

### 1. roles

Defines system roles with different permission levels.

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` — Primary key
- `name` — Role name (ADMIN, DEPOT_MANAGER, TECHNICIAN)
- `description` — Role description
- `created_at` — Record creation timestamp

**Data:**
```text
1 | ADMIN           | Full system access
2 | DEPOT_MANAGER   | Depot-level operations
3 | TECHNICIAN      | Maintenance operations
```

---

### 2. departments

Organizational departments that manage assets.

```sql
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id INT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `name` — Department name
- `description` — Department description
- `manager_id` — Foreign key to users
- `status` — ACTIVE or INACTIVE
- `created_at` — Creation timestamp
- `updated_at` — Last update timestamp

**Example Data:**
```text
Urban Transport Operations
Fleet Management
Infrastructure
Maintenance
Electrical Operations
Security
```

---

### 3. locations

Physical locations where assets are deployed.

```sql
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  contact_number VARCHAR(20),
  manager_id INT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `name` — Location name
- `type` — Depot, Workshop, Charging Station, etc.
- `address` — Physical address
- `city` — City
- `state` — State
- `postal_code` — Postal code
- `contact_number` — Contact number
- `manager_id` — Foreign key to users
- `status` — ACTIVE or INACTIVE

**Example Data:**
```text
Central Depot
North Depot
South Depot
East Depot
Workshop 1
Workshop 2
Charging Station A
```

---

### 4. users

System users with different roles and permissions.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  department_id INT,
  location_id INT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `name` — User full name
- `email` — User email (unique, used for login)
- `password_hash` — bcrypt hashed password
- `role_id` — Foreign key to roles
- `department_id` — Foreign key to departments
- `location_id` — Assigned location for depot managers
- `status` — ACTIVE or INACTIVE
- `created_at` — Account creation timestamp
- `updated_at` — Last update timestamp

**Security:**
- Passwords are hashed using bcrypt
- Email is unique
- Role is required

---

### 5. assets

Central table storing all infrastructure assets.

```sql
CREATE TABLE assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100),
  registration_number VARCHAR(100),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(15, 2),
  warranty_start DATE,
  warranty_expiry DATE,
  ownership_type ENUM('GOVERNMENT_OWNED', 'PRIVATE', 'PPP', 'LEASED'),
  current_location_id INT,
  department_id INT,
  custodian_id INT,
  status ENUM(
    'PROCURED',
    'REGISTERED',
    'ASSIGNED',
    'OPERATIONAL',
    'UNDER_INSPECTION',
    'UNDER_MAINTENANCE',
    'TRANSFERRED',
    'RETIRED'
  ) DEFAULT 'PROCURED',
  condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'),
  
  -- Vehicle-specific fields (nullable for non-vehicles)
  fuel_type VARCHAR(50),
  seating_capacity INT,
  mileage INT,
  battery_capacity INT,
  
  last_inspection_date DATE,
  next_inspection_date DATE,
  last_maintenance_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (current_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (custodian_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Core Columns:**
- `id` — Primary key
- `asset_code` — Unique asset identifier (e.g., BUS-104)
- `name` — Asset name
- `asset_type` — Specific type (Electric Bus, CCTV Camera, etc.)
- `category` — Broad category (Vehicles, Operational Equipment, etc.)
- `serial_number` — Manufacturer serial number
- `registration_number` — Government registration number

**Financial:**
- `purchase_date` — Date of purchase
- `purchase_cost` — Purchase cost
- `warranty_start` — Warranty start date
- `warranty_expiry` — Warranty expiry date
- `ownership_type` — GOVERNMENT_OWNED, PRIVATE, PPP, LEASED

**Organizational:**
- `current_location_id` — Current physical location
- `department_id` — Owning department
- `custodian_id` — Person responsible

**Operational:**
- `status` — Lifecycle status
- `condition` — Physical condition
- `last_inspection_date` — Last inspection
- `next_inspection_date` — Next scheduled inspection
- `last_maintenance_date` — Last maintenance

**Vehicle-Specific (nullable):**
- `fuel_type` — Diesel, CNG, Electric, etc.
- `seating_capacity` — Number of seats
- `mileage` — Current mileage
- `battery_capacity` — For electric vehicles (kWh)

**Indexes Required:**
```sql
CREATE INDEX idx_asset_code ON assets(asset_code);
CREATE INDEX idx_asset_type ON assets(asset_type);
CREATE INDEX idx_category ON assets(category);
CREATE INDEX idx_status ON assets(status);
CREATE INDEX idx_condition ON assets(condition);
CREATE INDEX idx_location ON assets(current_location_id);
CREATE INDEX idx_department ON assets(department_id);
CREATE INDEX idx_warranty_expiry ON assets(warranty_expiry);
```

---

### 6. asset_lifecycle

Complete historical record of all asset lifecycle events.

```sql
CREATE TABLE asset_lifecycle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  location_id INT,
  performed_by INT NOT NULL,
  reason TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Foreign key to assets
- `previous_status` — Status before change
- `new_status` — Status after change
- `event_type` — Type of event (PROCURED, ASSIGNED, MAINTENANCE, TRANSFERRED, etc.)
- `location_id` — Location at the time of event
- `performed_by` — User who performed the action
- `reason` — Reason for change
- `remarks` — Additional notes
- `created_at` — Event timestamp

**Purpose:**
- Complete audit trail
- Lifecycle visualization
- Historical analysis
- Accountability

**Immutability:**
Lifecycle records should never be updated or deleted (CASCADE only on asset deletion).

**Index:**
```sql
CREATE INDEX idx_lifecycle_asset ON asset_lifecycle(asset_id);
CREATE INDEX idx_lifecycle_date ON asset_lifecycle(created_at);
```

---

### 7. inspections

Asset inspection records.

```sql
CREATE TABLE inspections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  inspector_id INT NOT NULL,
  inspection_date DATE NOT NULL,
  result ENUM('PASS', 'FAIL', 'REQUIRES_ATTENTION') NOT NULL,
  condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL') NOT NULL,
  findings TEXT,
  recommendations TEXT,
  next_inspection_date DATE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE RESTRICT
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Foreign key to assets
- `inspector_id` — Foreign key to users (inspector)
- `inspection_date` — Date of inspection
- `result` — PASS, FAIL, REQUIRES_ATTENTION
- `condition` — Asset condition after inspection
- `findings` — Inspection findings
- `recommendations` — Recommendations
- `next_inspection_date` — Next scheduled inspection
- `remarks` — Additional notes

**Business Logic:**
- Inspection updates `assets.condition`
- Inspection updates `assets.last_inspection_date`
- Inspection sets `assets.next_inspection_date`

**Index:**
```sql
CREATE INDEX idx_inspection_asset ON inspections(asset_id);
CREATE INDEX idx_inspection_date ON inspections(inspection_date);
CREATE INDEX idx_next_inspection ON inspections(next_inspection_date);
```

---

### 8. maintenance_requests

Asset maintenance tracking from issue to resolution.

```sql
CREATE TABLE maintenance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  reported_by INT NOT NULL,
  assigned_technician INT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  diagnosis TEXT,
  resolution TEXT,
  maintenance_cost DECIMAL(12, 2),
  parts_used TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_technician) REFERENCES users(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Foreign key to assets
- `reported_by` — User who reported the issue
- `assigned_technician` — Technician assigned to fix
- `title` — Issue title
- `description` — Detailed description
- `priority` — LOW, MEDIUM, HIGH, CRITICAL
- `status` — OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- `reported_at` — When issue was reported
- `scheduled_at` — When maintenance is scheduled
- `started_at` — When maintenance started
- `completed_at` — When maintenance completed
- `diagnosis` — Technician's diagnosis
- `resolution` — How issue was resolved
- `maintenance_cost` — Cost of maintenance
- `parts_used` — Parts/services used
- `remarks` — Additional notes

**Workflow:**
```text
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```

**Business Logic:**
- When status = IN_PROGRESS: asset.status = UNDER_MAINTENANCE
- When status = COMPLETED: asset.status = OPERATIONAL
- Updates asset.last_maintenance_date

**Indexes:**
```sql
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_technician ON maintenance_requests(assigned_technician);
CREATE INDEX idx_maintenance_reported ON maintenance_requests(reported_at);
```

---

### 9. asset_transfers

Asset movement between locations.

```sql
CREATE TABLE asset_transfers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  from_location_id INT NOT NULL,
  to_location_id INT NOT NULL,
  requested_by INT NOT NULL,
  approved_by INT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transfer_date TIMESTAMP NULL,
  reason TEXT,
  status ENUM('REQUESTED', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED') DEFAULT 'REQUESTED',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Foreign key to assets
- `from_location_id` — Source location
- `to_location_id` — Destination location
- `requested_by` — User who requested transfer
- `approved_by` — User who approved transfer
- `request_date` — Request date
- `transfer_date` — Actual transfer date
- `reason` — Reason for transfer
- `status` — REQUESTED, APPROVED, IN_TRANSIT, COMPLETED, REJECTED
- `remarks` — Additional notes

**Workflow:**
```text
REQUESTED → APPROVED → IN_TRANSIT → COMPLETED
```

**Business Logic (on COMPLETED):**
- Update assets.current_location_id = to_location_id
- Create lifecycle event (TRANSFERRED)
- Create audit log

**Transaction Required:** Yes (atomic update of transfer + asset location + lifecycle + audit)

**Indexes:**
```sql
CREATE INDEX idx_transfer_asset ON asset_transfers(asset_id);
CREATE INDEX idx_transfer_status ON asset_transfers(status);
CREATE INDEX idx_transfer_from ON asset_transfers(from_location_id);
CREATE INDEX idx_transfer_to ON asset_transfers(to_location_id);
```

---

### 10. documents

Asset-related document metadata.

```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_url VARCHAR(500),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Foreign key to assets
- `document_type` — Purchase, Warranty, Service, Inspection, etc.
- `document_name` — Document name
- `document_url` — URL or file path
- `uploaded_by` — User who uploaded
- `created_at` — Upload timestamp

**MVP Implementation:**
- Store document metadata
- Store URL/path references
- Actual file storage can be added later (S3/cloud storage)

**Index:**
```sql
CREATE INDEX idx_document_asset ON documents(asset_id);
```

---

### 11. alerts

System-generated alerts for assets requiring attention.

```sql
CREATE TABLE alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT,
  type VARCHAR(50) NOT NULL,
  severity ENUM('INFO', 'WARNING', 'HIGH', 'CRITICAL') DEFAULT 'INFO',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);
```

**Columns:**
- `id` — Primary key
- `asset_id` — Related asset (nullable for system alerts)
- `type` — Alert type (MAINTENANCE_DUE, INSPECTION_OVERDUE, WARRANTY_EXPIRING, etc.)
- `severity` — INFO, WARNING, HIGH, CRITICAL
- `title` — Alert title
- `message` — Alert message
- `is_read` — Read status
- `created_at` — Alert creation timestamp

**Alert Types:**
- MAINTENANCE_DUE
- CRITICAL_MAINTENANCE
- INSPECTION_OVERDUE
- INSPECTION_DUE
- WARRANTY_EXPIRING
- WARRANTY_EXPIRED
- POOR_CONDITION
- CRITICAL_CONDITION
- PENDING_TRANSFER
- INACTIVE_ASSET

**Index:**
```sql
CREATE INDEX idx_alert_asset ON alerts(asset_id);
CREATE INDEX idx_alert_severity ON alerts(severity);
CREATE INDEX idx_alert_read ON alerts(is_read);
```

---

### 12. audit_logs

System-wide audit trail.

```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Columns:**
- `id` — Primary key
- `user_id` — User who performed action
- `action` — Action performed (LOGIN, ASSET_CREATED, ASSET_UPDATED, etc.)
- `entity_type` — Type of entity (ASSET, USER, MAINTENANCE, TRANSFER, etc.)
- `entity_id` — ID of affected entity
- `old_value` — Previous value (JSON or text)
- `new_value` — New value (JSON or text)
- `ip_address` — Client IP address
- `created_at` — Action timestamp

**Actions:**
- LOGIN
- LOGOUT
- ASSET_CREATED
- ASSET_UPDATED
- ASSET_STATUS_CHANGED
- ASSET_TRANSFERRED
- MAINTENANCE_CREATED
- MAINTENANCE_COMPLETED
- INSPECTION_CREATED
- INSPECTION_COMPLETED
- USER_CREATED
- USER_UPDATED
- LOCATION_CREATED

**Index:**
```sql
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

---

## Database Constraints

### Primary Keys
Every table has an auto-increment integer primary key.

### Foreign Keys
All foreign keys have appropriate `ON DELETE` actions:
- `RESTRICT` — Prevent deletion if referenced
- `CASCADE` — Delete dependent records
- `SET NULL` — Set to NULL if parent deleted

### Unique Constraints
- `users.email`
- `assets.asset_code`
- `roles.name`

### NOT NULL Constraints
Critical fields are marked NOT NULL to ensure data integrity.

### ENUM Constraints
Status and type fields use ENUM for controlled values.

---

## Indexes Summary

### Performance Indexes

```sql
-- Assets
CREATE INDEX idx_asset_code ON assets(asset_code);
CREATE INDEX idx_asset_status ON assets(status);
CREATE INDEX idx_asset_location ON assets(current_location_id);
CREATE INDEX idx_asset_warranty ON assets(warranty_expiry);

-- Lifecycle
CREATE INDEX idx_lifecycle_asset ON asset_lifecycle(asset_id);
CREATE INDEX idx_lifecycle_date ON asset_lifecycle(created_at);

-- Maintenance
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);

-- Inspections
CREATE INDEX idx_inspection_asset ON inspections(asset_id);
CREATE INDEX idx_inspection_next_date ON inspections(next_inspection_date);

-- Transfers
CREATE INDEX idx_transfer_asset ON asset_transfers(asset_id);
CREATE INDEX idx_transfer_status ON asset_transfers(status);

-- Audit
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

---

## Transaction Examples

### Example 1: Complete Maintenance

```sql
START TRANSACTION;

-- Update maintenance
UPDATE maintenance_requests 
SET status = 'COMPLETED',
    completed_at = NOW(),
    resolution = 'Battery replaced'
WHERE id = 123;

-- Update asset
UPDATE assets 
SET status = 'OPERATIONAL',
    last_maintenance_date = CURDATE()
WHERE id = 456;

-- Create lifecycle event
INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, performed_by)
VALUES (456, 'UNDER_MAINTENANCE', 'OPERATIONAL', 'MAINTENANCE_COMPLETED', 789);

-- Create audit log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
VALUES (789, 'MAINTENANCE_COMPLETED', 'MAINTENANCE', 123);

COMMIT;
```

### Example 2: Complete Transfer

```sql
START TRANSACTION;

-- Update transfer
UPDATE asset_transfers 
SET status = 'COMPLETED',
    transfer_date = NOW()
WHERE id = 101;

-- Update asset location
UPDATE assets 
SET current_location_id = 5
WHERE id = 456;

-- Create lifecycle event
INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, location_id, performed_by)
VALUES (456, 'OPERATIONAL', 'TRANSFERRED', 'TRANSFERRED', 5, 789);

-- Create audit log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
VALUES (789, 'TRANSFER_COMPLETED', 'TRANSFER', 101);

COMMIT;
```

---

## Data Integrity Rules

### 1. Asset Identity
- `asset_code` must be unique
- `serial_number` should be unique (when provided)

### 2. Lifecycle Integrity
- Every status change must create a lifecycle record
- Lifecycle records are immutable

### 3. Location Consistency
- Asset can have only one `current_location_id`
- Transfer completion must update asset location

### 4. Status Consistency
- Asset under maintenance: status = UNDER_MAINTENANCE
- Asset operational: status = OPERATIONAL
- Invalid transitions prevented by application logic

### 5. User Integrity
- Users cannot be deleted if they:
  - Created maintenance requests
  - Performed lifecycle actions
  - Are referenced in audit logs

### 6. Referential Integrity
- All foreign keys enforce referential integrity
- Orphan records prevented by constraints

---

## Seed Data Requirements

Minimum seed data for testing:

### Roles
- ADMIN
- DEPOT_MANAGER
- TECHNICIAN

### Users
- 1 Admin
- 2 Depot Managers
- 4 Technicians

### Departments
- Urban Transport Operations
- Fleet Management
- Infrastructure
- Maintenance
- Electrical Operations
- Security

### Locations
- Central Depot
- North Depot
- South Depot
- East Depot
- Workshop 1
- Workshop 2
- Charging Station A

### Assets
- 40+ assets across all categories
- Variation in status, condition, location
- Some with upcoming inspections
- Some with active maintenance
- Some with expiring warranties

### Lifecycle Events
- Historical events for major assets

### Maintenance Requests
- 15+ records with varied statuses

### Inspections
- 15+ inspection records

### Transfers
- 8+ transfer records

---

## Query Patterns

### Dashboard Queries

**Total Assets by Status:**
```sql
SELECT status, COUNT(*) as count
FROM assets
GROUP BY status;
```

**Assets by Location:**
```sql
SELECT l.name, COUNT(a.id) as asset_count
FROM locations l
LEFT JOIN assets a ON l.id = a.current_location_id
GROUP BY l.id, l.name;
```

**Maintenance Due:**
```sql
SELECT COUNT(*) as count
FROM maintenance_requests
WHERE status IN ('OPEN', 'ASSIGNED')
  AND priority IN ('HIGH', 'CRITICAL');
```

**Inspection Overdue:**
```sql
SELECT COUNT(*) as count
FROM assets
WHERE next_inspection_date < CURDATE()
  AND status != 'RETIRED';
```

**Warranty Expiring Soon:**
```sql
SELECT COUNT(*) as count
FROM assets
WHERE warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND status != 'RETIRED';
```

### Asset Search

```sql
SELECT * FROM assets
WHERE (asset_code LIKE ? 
   OR name LIKE ? 
   OR registration_number LIKE ?)
  AND status = ?
  AND current_location_id = ?
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE transitasset CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transitasset;
```

### 2. Execute Schema

```bash
mysql -u root -p transitasset < database/schema.sql
```

### 3. Execute Indexes

```bash
mysql -u root -p transitasset < database/indexes.sql
```

### 4. Load Seed Data

```bash
mysql -u root -p transitasset < database/seed.sql
```

---

## Backup & Recovery

### Backup

```bash
mysqldump -u root -p transitasset > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
mysql -u root -p transitasset < backup_20260928.sql
```

---

## Security Considerations

1. **Password Hashing:** Never store plain-text passwords
2. **Prepared Statements:** Always use parameterized queries
3. **Foreign Keys:** Enforce referential integrity
4. **Constraints:** Use NOT NULL and UNIQUE appropriately
5. **Access Control:** Database user should have minimal required privileges
6. **Backup:** Regular automated backups
7. **Audit Trail:** Complete audit logging for accountability

---

## Conclusion

The TransitAsset database schema provides:

- **Complete asset inventory** with lifecycle tracking
- **Full audit trail** for accountability
- **Referential integrity** through foreign keys
- **Performance optimization** through indexes
- **Transaction support** for data consistency
- **Scalability** for growing asset counts

The schema is designed to be the single source of truth for all public transport infrastructure assets.
