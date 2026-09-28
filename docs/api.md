# TransitAsset — API Documentation

## Overview

TransitAsset exposes a REST API for all operations.

**Base URL:** `http://localhost:5000/api` (development)

**Authentication:** JWT Bearer Token

**Content Type:** `application/json`

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 123,
    "...": "..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description in human-readable form"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@transitasset.local",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@transitasset.local",
      "role": "ADMIN",
      "department": "Administration",
      "location": null
    }
  }
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid credentials
- 401: Account inactive

---

### POST /api/auth/logout

Logout current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@transitasset.local",
    "role": "ADMIN",
    "department": "Administration",
    "location": null,
    "status": "ACTIVE"
  }
}
```

---

## Assets

### POST /api/assets

Create a new asset.

**Permission:** ADMIN, DEPOT_MANAGER

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "asset_code": "BUS-201",
  "name": "Electric Bus - Route 45",
  "asset_type": "Electric Bus",
  "category": "Vehicles",
  "serial_number": "EB-2026-00201",
  "registration_number": "DL-1CX-9876",
  "manufacturer": "Tata Motors",
  "model": "Ultra Electric",
  "purchase_date": "2026-01-15",
  "purchase_cost": 6500000,
  "warranty_start": "2026-01-15",
  "warranty_expiry": "2029-01-15",
  "ownership_type": "GOVERNMENT_OWNED",
  "current_location_id": 1,
  "department_id": 2,
  "custodian_id": 3,
  "condition": "EXCELLENT",
  "fuel_type": "Electric",
  "seating_capacity": 40,
  "battery_capacity": 250,
  "description": "New electric bus for urban transport"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "id": 123,
    "asset_code": "BUS-201",
    "status": "PROCURED"
  }
}
```

**Errors:**
- 400: Validation error (missing fields, invalid format)
- 400: Duplicate asset_code
- 401: Not authenticated
- 403: Insufficient permissions

---

### GET /api/assets

Get list of assets with filtering and pagination.

**Permission:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): Search asset_code, name, registration_number
- `category` (optional): Filter by category
- `asset_type` (optional): Filter by type
- `status` (optional): Filter by status
- `condition` (optional): Filter by condition
- `location_id` (optional): Filter by location
- `department_id` (optional): Filter by department
- `ownership_type` (optional): Filter by ownership

**Example:**
```
GET /api/assets?page=1&limit=20&category=Vehicles&status=OPERATIONAL
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": 1,
        "asset_code": "BUS-104",
        "name": "Electric Bus - Central Route",
        "asset_type": "Electric Bus",
        "category": "Vehicles",
        "status": "OPERATIONAL",
        "condition": "GOOD",
        "current_location": "Central Depot",
        "department": "Fleet Management",
        "warranty_expiry": "2027-12-31",
        "last_maintenance_date": "2026-08-15"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 48,
      "pages": 3
    }
  }
}
```

---

### GET /api/assets/:id

Get detailed information about a specific asset.

**Permission:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "asset_code": "BUS-104",
    "name": "Electric Bus - Central Route",
    "asset_type": "Electric Bus",
    "category": "Vehicles",
    "serial_number": "EB-2024-00104",
    "registration_number": "DL-1CX-1234",
    "manufacturer": "Tata Motors",
    "model": "Ultra Electric 9m",
    "purchase_date": "2024-04-01",
    "purchase_cost": 6500000,
    "warranty_start": "2024-04-01",
    "warranty_expiry": "2027-04-01",
    "ownership_type": "GOVERNMENT_OWNED",
    "current_location": {
      "id": 1,
      "name": "Central Depot"
    },
    "department": {
      "id": 2,
      "name": "Fleet Management"
    },
    "custodian": {
      "id": 3,
      "name": "Rajesh Kumar"
    },
    "status": "OPERATIONAL",
    "condition": "GOOD",
    "fuel_type": "Electric",
    "seating_capacity": 40,
    "battery_capacity": 250,
    "last_inspection_date": "2026-08-01",
    "next_inspection_date": "2026-11-01",
    "last_maintenance_date": "2026-08-15",
    "description": "Electric bus for urban transport",
    "created_at": "2024-04-01T10:00:00Z",
    "updated_at": "2026-08-15T14:30:00Z"
  }
}
```

---

### PUT /api/assets/:id

Update asset information.

**Permission:** ADMIN, DEPOT_MANAGER (for assigned depot)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Asset Name",
  "condition": "FAIR",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "id": 1,
    "asset_code": "BUS-104"
  }
}
```

---

### DELETE /api/assets/:id

Soft delete or retire an asset.

**Permission:** ADMIN only

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

**Note:** Consider using status change to RETIRED instead of deletion.

---

## Asset Lifecycle

### POST /api/assets/:id/lifecycle

Change asset status (lifecycle transition).

**Permission:** ADMIN, DEPOT_MANAGER

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "new_status": "OPERATIONAL",
  "reason": "Asset deployed to depot",
  "remarks": "All checks completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset status updated successfully",
  "data": {
    "asset_id": 1,
    "previous_status": "REGISTERED",
    "new_status": "OPERATIONAL",
    "event_id": 45
  }
}
```

**Errors:**
- 400: Invalid status transition
- 400: Cannot transition retired asset
- 403: Insufficient permissions

---

### GET /api/assets/:id/lifecycle

Get complete lifecycle history for an asset.

**Permission:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "previous_status": null,
      "new_status": "PROCURED",
      "event_type": "PROCURED",
      "location": "Central Depot",
      "performed_by": "System Administrator",
      "reason": "Initial procurement",
      "remarks": null,
      "created_at": "2024-03-14T09:00:00Z"
    },
    {
      "id": 2,
      "previous_status": "PROCURED",
      "new_status": "REGISTERED",
      "event_type": "REGISTERED",
      "location": "Central Depot",
      "performed_by": "System Administrator",
      "reason": "Registration completed",
      "remarks": null,
      "created_at": "2024-04-20T10:30:00Z"
    }
  ]
}
```

---

## Locations

### GET /api/locations

Get all locations.

**Permission:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Central Depot",
      "type": "Depot",
      "city": "New Delhi",
      "state": "Delhi",
      "manager": "Rajesh Kumar",
      "status": "ACTIVE",
      "asset_count": 87
    }
  ]
}
```

---

### POST /api/locations

Create new location.

**Permission:** ADMIN

**Request:**
```json
{
  "name": "West Depot",
  "type": "Depot",
  "address": "Sector 12, Dwarka",
  "city": "New Delhi",
  "state": "Delhi",
  "postal_code": "110075",
  "contact_number": "+91-11-12345678",
  "manager_id": 3
}
```

---

### PUT /api/locations/:id

Update location.

**Permission:** ADMIN

---

## Departments

### GET /api/departments

Get all departments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Urban Transport Operations",
      "description": "Manages urban bus operations",
      "manager": "Priya Sharma",
      "status": "ACTIVE"
    }
  ]
}
```

---

### POST /api/departments

Create department.

**Permission:** ADMIN

---

## Maintenance

### POST /api/maintenance

Create maintenance request.

**Permission:** DEPOT_MANAGER, ADMIN

**Request:**
```json
{
  "asset_id": 1,
  "title": "Battery performance issue",
  "description": "Bus battery not holding charge properly",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 56,
    "status": "OPEN"
  }
}
```

---

### GET /api/maintenance

Get maintenance requests with filtering.

**Query Parameters:**
- `status` (optional)
- `priority` (optional)
- `asset_id` (optional)
- `assigned_technician` (optional)
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 56,
        "asset_code": "BUS-104",
        "asset_name": "Electric Bus",
        "title": "Battery performance issue",
        "priority": "HIGH",
        "status": "OPEN",
        "reported_by": "Rajesh Kumar",
        "assigned_technician": null,
        "reported_at": "2026-09-28T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

### GET /api/maintenance/:id

Get detailed maintenance request.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 56,
    "asset": {
      "id": 1,
      "asset_code": "BUS-104",
      "name": "Electric Bus"
    },
    "title": "Battery performance issue",
    "description": "Bus battery not holding charge properly",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "reported_by": "Rajesh Kumar",
    "assigned_technician": "Amit Singh",
    "reported_at": "2026-09-28T10:00:00Z",
    "scheduled_at": "2026-09-29T09:00:00Z",
    "started_at": "2026-09-29T09:15:00Z",
    "completed_at": null,
    "diagnosis": "Battery cells degraded",
    "resolution": null,
    "maintenance_cost": null,
    "parts_used": null,
    "remarks": null
  }
}
```

---

### PUT /api/maintenance/:id

Update maintenance request.

**Permission:** TECHNICIAN (assigned), ADMIN

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "diagnosis": "Battery cells degraded",
  "started_at": "2026-09-29T09:15:00Z"
}
```

---

### PUT /api/maintenance/:id/complete

Complete maintenance request.

**Permission:** TECHNICIAN (assigned), ADMIN

**Request:**
```json
{
  "resolution": "Replaced battery pack with new unit",
  "maintenance_cost": 45000,
  "parts_used": "Battery Pack - 250kWh, Labor",
  "remarks": "Battery warranty valid for 2 years"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance completed successfully",
  "data": {
    "maintenance_id": 56,
    "asset_status": "OPERATIONAL"
  }
}
```

**Side Effects:**
- Maintenance status → COMPLETED
- Asset status → OPERATIONAL
- Asset last_maintenance_date updated
- Lifecycle event created
- Audit log created

---

## Inspections

### POST /api/inspections

Create inspection record.

**Permission:** DEPOT_MANAGER, TECHNICIAN, ADMIN

**Request:**
```json
{
  "asset_id": 1,
  "inspection_date": "2026-09-28",
  "result": "PASS",
  "condition": "GOOD",
  "findings": "All systems operational. Minor wear on tires.",
  "recommendations": "Replace tires within 3 months",
  "next_inspection_date": "2026-12-28"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inspection recorded successfully",
  "data": {
    "id": 78,
    "asset_id": 1
  }
}
```

---

### GET /api/inspections

Get inspection records with filtering.

**Query Parameters:**
- `asset_id` (optional)
- `result` (optional)
- `page` (default: 1)
- `limit` (default: 20)

---

### GET /api/inspections/:id

Get detailed inspection.

---

## Transfers

### POST /api/transfers

Create transfer request.

**Permission:** DEPOT_MANAGER, ADMIN

**Request:**
```json
{
  "asset_id": 1,
  "from_location_id": 1,
  "to_location_id": 3,
  "reason": "Depot rebalancing - higher demand in south region"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer request created successfully",
  "data": {
    "id": 23,
    "status": "REQUESTED"
  }
}
```

**Validation:**
- Asset exists
- Asset not RETIRED
- From/to locations different
- Locations valid

---

### GET /api/transfers

Get transfer requests with filtering.

**Query Parameters:**
- `status` (optional)
- `asset_id` (optional)
- `from_location_id` (optional)
- `to_location_id` (optional)

---

### GET /api/transfers/:id

Get detailed transfer information.

---

### PUT /api/transfers/:id/approve

Approve transfer request.

**Permission:** ADMIN

**Response:**
```json
{
  "success": true,
  "message": "Transfer approved successfully",
  "data": {
    "id": 23,
    "status": "APPROVED"
  }
}
```

---

### PUT /api/transfers/:id/complete

Complete transfer.

**Permission:** ADMIN, DEPOT_MANAGER (destination)

**Response:**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "id": 23,
    "status": "COMPLETED",
    "asset_location_updated": true
  }
}
```

**Side Effects:**
- Transfer status → COMPLETED
- Asset current_location_id updated
- Lifecycle event created
- Audit log created

---

### PUT /api/transfers/:id/reject

Reject transfer request.

**Permission:** ADMIN

---

## Dashboard

### GET /api/dashboard/summary

Get dashboard summary statistics.

**Permission:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "total_assets": 248,
    "operational": 213,
    "under_maintenance": 18,
    "under_inspection": 6,
    "retired": 11,
    "maintenance_due": 8,
    "inspection_due": 12,
    "warranty_expiring": 6
  }
}
```

---

### GET /api/dashboard/assets-by-type

Get asset distribution by type.

**Response:**
```json
{
  "success": true,
  "data": [
    { "asset_type": "Electric Bus", "count": 45 },
    { "asset_type": "Diesel Bus", "count": 38 },
    { "asset_type": "CCTV Camera", "count": 52 }
  ]
}
```

---

### GET /api/dashboard/assets-by-status

Get asset distribution by status.

---

### GET /api/dashboard/assets-by-location

Get asset distribution by location.

---

### GET /api/dashboard/maintenance-trend

Get maintenance statistics by month.

**Query Parameters:**
- `months` (default: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    { "month": "2026-04", "count": 12, "cost": 145000 },
    { "month": "2026-05", "count": 15, "cost": 189000 },
    { "month": "2026-06", "count": 18, "cost": 234000 }
  ]
}
```

---

## Alerts

### GET /api/alerts

Get alerts for current user.

**Query Parameters:**
- `severity` (optional)
- `is_read` (optional)
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 12,
        "type": "INSPECTION_OVERDUE",
        "severity": "HIGH",
        "title": "Inspection Overdue",
        "message": "Asset BUS-104 inspection overdue by 15 days",
        "asset_id": 1,
        "is_read": false,
        "created_at": "2026-09-28T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    }
  }
}
```

---

### PUT /api/alerts/:id/read

Mark alert as read.

---

## Audit Logs

### GET /api/audit-logs

Get system audit logs.

**Permission:** ADMIN

**Query Parameters:**
- `user_id` (optional)
- `action` (optional)
- `entity_type` (optional)
- `start_date` (optional)
- `end_date` (optional)
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 456,
        "user": "System Administrator",
        "action": "ASSET_CREATED",
        "entity_type": "ASSET",
        "entity_id": 123,
        "old_value": null,
        "new_value": "{\"asset_code\":\"BUS-201\"}",
        "ip_address": "192.168.1.10",
        "created_at": "2026-09-28T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1234,
      "pages": 25
    }
  }
}
```

---

## Users

### GET /api/users

Get all users.

**Permission:** ADMIN

---

### POST /api/users

Create new user.

**Permission:** ADMIN

**Request:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role_id": 2,
  "department_id": 3,
  "location_id": 1
}
```

---

### PUT /api/users/:id

Update user.

**Permission:** ADMIN

---

### DELETE /api/users/:id

Deactivate user.

**Permission:** ADMIN

---

## Error Codes

### Authentication Errors

| Code | Message |
|------|---------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Invalid token |
| AUTH_004 | No token provided |
| AUTH_005 | Account inactive |

### Authorization Errors

| Code | Message |
|------|---------|
| AUTHZ_001 | Insufficient permissions |
| AUTHZ_002 | Resource access denied |

### Validation Errors

| Code | Message |
|------|---------|
| VAL_001 | Required field missing |
| VAL_002 | Invalid format |
| VAL_003 | Invalid value |
| VAL_004 | Duplicate entry |

### Business Logic Errors

| Code | Message |
|------|---------|
| BIZ_001 | Invalid status transition |
| BIZ_002 | Asset already retired |
| BIZ_003 | Transfer locations cannot be same |
| BIZ_004 | Asset has active transfer |

---

## Rate Limiting

Rate limiting will be implemented in production:

- 100 requests per minute per user
- 1000 requests per hour per IP

---

## Versioning

API version is included in the base path:

- Current: `/api/v1/...`
- Future: `/api/v2/...`

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 248,
    "pages": 13
  }
}
```

---

## Filtering & Sorting

**Filtering:**
Add filter parameters as query strings:
```
GET /api/assets?status=OPERATIONAL&category=Vehicles
```

**Sorting:**
```
GET /api/assets?sort_by=created_at&order=desc
```

---

## Testing with Postman

Import the Postman collection:
```
postman/TransitAsset.postman_collection.json
```

**Environment Variables:**
- `base_url`: http://localhost:5000/api
- `token`: (set after login)

---

## WebSocket (Future)

Real-time notifications will be added:
- Asset status changes
- New maintenance requests
- Transfer approvals
- Critical alerts

---

## Conclusion

The TransitAsset API provides comprehensive access to all asset management operations with:

- RESTful design
- JWT authentication
- Role-based authorization
- Input validation
- Consistent response format
- Complete error handling
- Pagination support
- Filtering capabilities

All endpoints enforce security and business rules at the backend level.
