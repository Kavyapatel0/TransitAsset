# TransitAsset Database

## Setup Instructions

### 1. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE transitasset CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transitasset;
```

### 2. Execute Schema

```bash
mysql -u root -p transitasset < schema.sql
```

### 3. Execute Indexes

```bash
mysql -u root -p transitasset < indexes.sql
```

### 4. Load Seed Data

```bash
mysql -u root -p transitasset < seed.sql
```

## Database Structure

The database contains the following tables:

- `roles` - User roles
- `departments` - Organizational departments
- `locations` - Physical locations/depots
- `users` - System users
- `assets` - Infrastructure assets
- `asset_lifecycle` - Asset lifecycle history
- `inspections` - Asset inspections
- `maintenance_requests` - Maintenance tracking
- `asset_transfers` - Asset transfers between locations
- `documents` - Asset documents metadata
- `alerts` - System alerts
- `audit_logs` - System audit trail

## Connection Details

**Host:** localhost  
**Port:** 3306  
**Database:** transitasset  
**User:** root (or configured user)  
**Password:** (configured in .env)

## Demo Credentials

After running seed.sql, use these credentials:

**Admin:**
- Email: admin@transitasset.local
- Password: Admin@123

**Depot Manager:**
- Email: manager@transitasset.local
- Password: Manager@123

**Technician:**
- Email: technician@transitasset.local
- Password: Tech@123

## Backup & Restore

**Backup:**
```bash
mysqldump -u root -p transitasset > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
mysql -u root -p transitasset < backup_20260928.sql
```

## Important Notes

1. All passwords in seed data are hashed with bcrypt
2. Foreign key constraints enforce referential integrity
3. Lifecycle and audit logs should never be deleted
4. Use transactions for multi-step operations
5. Regular backups are recommended

## Schema Documentation

See `/docs/database.md` for complete schema documentation.
