# TransitAsset

### End-to-End Public Transport Infrastructure Asset Lifecycle Management Platform

TransitAsset is a centralized asset management platform designed for government and public transport authorities to **register, track, monitor, maintain, transfer, and retire physical infrastructure assets throughout their complete lifecycle**.

The platform provides a unified view of public transport assets such as buses, electric buses, charging stations, ticketing machines, CCTV systems, depot equipment, and other operational infrastructure distributed across multiple depots and locations.

---

## 1. Problem Statement

Public transport authorities manage a large number of physical assets across multiple depots, departments, workshops, and operational locations.

Asset information can become fragmented across spreadsheets, departments, and disconnected systems, making it difficult to answer questions such as:

- What assets currently exist?
- Where is each asset located?
- Who is responsible for it?
- What is its current operational condition?
- Which assets require maintenance?
- What maintenance has already been performed?
- Has an asset been transferred between locations?
- When was an asset procured?
- Is its warranty still active?
- When should it be inspected or serviced?
- When was the asset retired?

TransitAsset addresses this problem by maintaining a **centralized asset registry and complete lifecycle history for every physical asset**.

---

# 2. Objective

The primary objective of TransitAsset is to create a single source of truth for public transport infrastructure assets.

The system should allow authorities to:

1. Register and categorize physical assets.
2. Track asset ownership and responsibility.
3. Track asset location and movement.
4. Monitor asset operational status and condition.
5. Manage inspections and maintenance.
6. Maintain a complete lifecycle history.
7. Track warranty and important asset dates.
8. Manage transfers between depots.
9. Identify assets requiring attention.
10. Retire assets while preserving their historical records.
11. Provide dashboards and analytics for operational decision-making.

---

# 3. Target Domain

TransitAsset is designed specifically for the **government/public transport sector**.

The platform can support assets belonging to:

- City transport authorities
- State transport corporations
- Municipal transport departments
- Metro and transit authorities
- Public bus operators
- Government-owned transport infrastructure

---

# 4. Asset Categories

TransitAsset will support multiple categories of physical assets.

## 4.1 Vehicles

- Diesel buses
- CNG buses
- Electric buses
- Other public transport vehicles

Example attributes:

- Registration number
- Manufacturer
- Model
- Fuel type
- Seating capacity
- Purchase date
- Mileage
- Battery capacity for electric vehicles

## 4.2 Depot Infrastructure

- Depots
- Workshops
- Charging stations
- Fuel stations
- Maintenance equipment
- Parking infrastructure

## 4.3 Operational Equipment

- Ticketing machines
- POS devices
- GPS devices
- Passenger information displays
- CCTV cameras
- Security equipment

## 4.4 General Infrastructure Equipment

- Generators
- Networking equipment
- Electrical equipment
- Office equipment
- Other authority-owned infrastructure assets

The architecture is designed so that additional asset categories can be added without redesigning the entire system.

---

# 5. User Roles

## 5.1 System Administrator

The administrator has system-wide access.

Responsibilities:

- Register assets
- Edit asset information
- Deactivate assets
- Manage locations
- Manage departments
- Manage users
- Assign assets
- Transfer assets
- View lifecycle history
- Monitor maintenance
- View dashboards and analytics

---

## 5.2 Depot Manager

The depot manager manages assets belonging to a particular depot.

Responsibilities:

- View depot assets
- Assign assets
- Report maintenance issues
- Request asset transfers
- Schedule inspections
- View asset history
- Monitor asset condition

---

## 5.3 Maintenance Technician

The technician manages maintenance activities.

Responsibilities:

- View assigned maintenance requests
- Update maintenance status
- Record inspection results
- Add repair details
- Record parts/services used
- Complete maintenance
- Return assets to operational status

---

# 6. Core Modules

TransitAsset will contain the following modules.

---

## Module 1 — Authentication & Role-Based Access Control

Provides secure access to the platform.

### Features

- Login/logout
- User authentication
- Role-based authorization
- Protected routes
- User status management
- Role-specific permissions

### Roles

```text
ADMIN
DEPOT_MANAGER
TECHNICIAN
```

---

# Module 2 — Asset Registry

The central module of the platform.

It maintains the master inventory of all physical assets.

### Features

- Add asset
- View asset
- Edit asset
- Deactivate asset
- Search assets
- Filter assets
- Sort assets
- Categorize assets
- View asset details

### Common asset information

```text
Asset ID
Asset Name
Asset Type
Asset Category
Serial Number
Registration Number
Manufacturer
Model
Purchase Date
Purchase Cost
Warranty Expiry
Current Location
Department
Custodian
Status
Condition
Last Inspection Date
Next Inspection Date
Last Maintenance Date
```

---

# Module 3 — Location & Depot Management

Maintains the physical locations where assets are deployed.

### Features

- Create location
- Edit location
- View location
- Assign assets to locations
- View assets by location
- Track depot-wise asset distribution

### Example locations

```text
Central Depot
North Depot
South Depot
East Depot
Workshop 1
Workshop 2
Charging Station A
```

Asset location should always represent the asset's **current physical location**.

---

# Module 4 — Department & Ownership Management

Tracks organizational responsibility for assets.

### Features

- Create departments
- Assign assets to departments
- Assign custodians
- Track ownership type
- View department-wise assets

### Ownership types

```text
Government Owned
Private
PPP
Leased
```

This allows the system to handle assets operated under different public-transport models.

---

# Module 5 — Asset Lifecycle Management

This is the **core module of TransitAsset** and directly addresses the hackathon requirement.

Every asset moves through a defined lifecycle.

### Lifecycle

```text
PROCURED
   ↓
REGISTERED
   ↓
ASSIGNED
   ↓
OPERATIONAL
   ↓
UNDER_INSPECTION
   ↓
UNDER_MAINTENANCE
   ↓
OPERATIONAL
   ↓
TRANSFERRED
   ↓
OPERATIONAL
   ↓
RETIRED
```

### Features

- Change asset status
- Validate lifecycle transitions
- Record transition date
- Record user performing the action
- Store reason
- Maintain complete lifecycle history

### Example

```text
Bus BUS-104

14 Mar 2024  → Procured
20 Apr 2024  → Registered
25 Apr 2024  → Central Depot
01 May 2024  → Operational
08 Sep 2026  → Maintenance
12 Sep 2026  → Repair Completed
13 Sep 2026  → Operational
20 Sep 2026  → North Depot
```

Every important lifecycle transition should create an immutable history record.

---

# Module 6 — Asset Inspection

Allows authorities to periodically inspect physical assets.

### Features

- Schedule inspection
- Record inspection
- Assign inspector
- Record condition
- Add inspection notes
- Pass/fail inspection
- Set next inspection date
- View inspection history

### Inspection conditions

```text
EXCELLENT
GOOD
FAIR
POOR
CRITICAL
```

---

# Module 7 — Maintenance Management

Tracks asset maintenance from issue reporting to resolution.

### Features

- Report maintenance issue
- Create maintenance request
- Assign technician
- Set priority
- Track status
- Record diagnosis
- Record repair
- Record maintenance cost
- Record parts/services
- Mark maintenance complete
- Update asset status

### Maintenance statuses

```text
OPEN
ASSIGNED
IN_PROGRESS
COMPLETED
CANCELLED
```

### Priority

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Example workflow

```text
Issue Reported
      ↓
Maintenance Request Created
      ↓
Technician Assigned
      ↓
Work In Progress
      ↓
Repair Completed
      ↓
Inspection
      ↓
Asset Returned to Operational State
```

---

# Module 8 — Asset Transfer Management

Allows controlled movement of assets between locations.

### Example

```text
Central Depot
       ↓
Transfer Request
       ↓
North Depot
```

### Features

- Create transfer request
- Select source location
- Select destination location
- Specify reason
- Approve transfer
- Complete transfer
- Update current location
- Maintain transfer history

### Transfer record

```text
Transfer ID
Asset ID
From Location
To Location
Requested By
Approved By
Transfer Date
Reason
Status
```

### Transfer statuses

```text
REQUESTED
APPROVED
IN_TRANSIT
COMPLETED
REJECTED
```

---

# Module 9 — Warranty & Document Management

Maintains important asset documents and dates.

### Features

- Track purchase date
- Track warranty expiry
- Track service contracts
- Store document references
- Identify upcoming expirations

### Alerts

```text
Warranty expires in 30 days
Warranty expired
Service contract expiring
```

For the hackathon MVP, documents can initially be represented through metadata or file links instead of implementing a complex document-storage system.

---

# Module 10 — Asset Condition & Health Monitoring

Provides a consolidated view of asset health.

### Asset condition

```text
EXCELLENT
GOOD
FAIR
POOR
CRITICAL
```

### Asset health score

The system can calculate a simple score using factors such as:

- Current condition
- Asset age
- Maintenance frequency
- Inspection results
- Warranty status

Example:

```text
BUS-104

Asset Health
82 / 100

Condition: GOOD
Age: 2.4 years
Recent Maintenance: Yes
Inspection: Passed
Warranty: Active
```

This is a decision-support feature rather than a replacement for actual engineering inspection.

---

# Module 11 — Alerts & Action Center

Provides a centralized list of assets requiring attention.

### Alerts

- Maintenance due
- Inspection due
- Warranty expiring
- Warranty expired
- Asset in poor condition
- Critical maintenance request
- Asset inactive for an extended period
- Pending transfer

### Example

```text
⚠ 8 assets require inspection
⚠ 4 assets are under maintenance
⚠ 6 warranties expire within 30 days
⚠ 3 assets have poor condition
⚠ 2 transfer requests are pending
```

---

# Module 12 — Dashboard & Analytics

Provides management-level visibility.

### Key statistics

```text
Total Assets
Operational Assets
Assets Under Maintenance
Assets Under Inspection
Retired Assets
Maintenance Due
Warranty Expiring
```

### Charts

- Assets by category
- Assets by location
- Assets by status
- Assets by condition
- Maintenance requests by month
- Maintenance cost by asset type
- Asset distribution by depot

### Management insights

Example:

```text
Central Depot
-------------------------
Assets: 248
Operational: 213
Maintenance: 18
Inspection Due: 11
Critical: 6
```

---

# Module 13 — Asset Lifecycle History / Audit Trail

Maintains a complete chronological history for each asset.

Every important action should generate an audit event.

### Example

```text
BUS-104

14 Mar 2024
Asset Procured

20 Apr 2024
Asset Registered

25 Apr 2024
Assigned to Central Depot

01 May 2024
Status changed to Operational

08 Sep 2026
Maintenance reported

09 Sep 2026
Technician assigned

12 Sep 2026
Maintenance completed

20 Sep 2026
Transferred to North Depot
```

### Audit information

```text
Timestamp
Asset
Action
Previous Value
New Value
Performed By
Reason
```

This provides traceability and accountability.

---

# Module 14 — Search, Filter & Reporting

Allows users to quickly find relevant assets.

### Search by

- Asset ID
- Registration number
- Serial number
- Asset name
- Location
- Manufacturer

### Filter by

- Asset type
- Status
- Condition
- Location
- Department
- Ownership type
- Maintenance status
- Warranty status

### Reports

- Asset inventory report
- Maintenance report
- Transfer report
- Inspection report
- Retired asset report

---

# 7. Important Business Rules

TransitAsset should not behave like a simple CRUD application.

The following business rules must be enforced.

### Rule 1 — Unique asset identity

Every asset must have a unique Asset ID.

### Rule 2 — One current location

An asset can have only one active physical location at a time.

### Rule 3 — Retired assets are immutable

A retired asset cannot be assigned, transferred, or returned to normal operational use without an explicit administrative process.

### Rule 4 — Maintenance restrictions

An asset under maintenance cannot simultaneously be marked as operational.

### Rule 5 — Lifecycle history

Every important status/location change must create a history entry.

### Rule 6 — Transfer consistency

Completing a transfer must update the asset's current location.

### Rule 7 — Maintenance completion

An asset should return to operational status only after the maintenance process is completed.

### Rule 8 — Role restrictions

Users can perform only the operations permitted by their role.

### Rule 9 — Historical preservation

Deleting an asset should not remove its lifecycle history. Assets should normally be deactivated/retired instead of physically deleted.

### Rule 10 — Inspection tracking

The system should identify assets whose next inspection date has passed.

---

# 8. Core Database Entities

The MVP database will contain the following major entities:

```text
users
departments
locations
assets
asset_lifecycle
inspections
maintenance_requests
asset_transfers
```

Optional entities for future expansion:

```text
maintenance_parts
documents
service_contracts
notifications
audit_logs
```

---

# 9. High-Level Relationships

```text
                    USERS
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
     MAINTENANCE   INSPECTION   LIFECYCLE
          │           │           │
          └───────────┴───────────┘
                      │
                    ASSETS
                  /    |     \
                 /     |      \
                ↓      ↓       ↓
          LOCATIONS  TRANSFERS  DEPARTMENTS
```

---

# 10. Technology Stack

## Frontend

- React.js
- Tailwind CSS
- Axios
- React Router
- Charting library

## Backend

- Node.js
- Express.js
- REST APIs
- JWT-based authentication

## Database

- MySQL

## Development Tools

- Git
- GitHub
- VS Code
- Postman

## Deployment

The application can be deployed using a suitable frontend and backend hosting platform.

---

# 11. API Modules

The backend will expose REST APIs for the major modules.

## Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Assets

```http
POST   /api/assets
GET    /api/assets
GET    /api/assets/:id
PUT    /api/assets/:id
DELETE /api/assets/:id
```

## Lifecycle

```http
POST /api/assets/:id/lifecycle
GET  /api/assets/:id/lifecycle
```

## Inspections

```http
POST /api/inspections
GET  /api/inspections
GET  /api/inspections/:id
PUT  /api/inspections/:id
```

## Maintenance

```http
POST /api/maintenance
GET  /api/maintenance
GET  /api/maintenance/:id
PUT  /api/maintenance/:id
```

## Transfers

```http
POST /api/transfers
GET  /api/transfers
GET  /api/transfers/:id
PUT  /api/transfers/:id
```

## Locations

```http
POST /api/locations
GET  /api/locations
PUT  /api/locations/:id
```

## Dashboard

```http
GET /api/dashboard/summary
GET /api/dashboard/assets-by-type
GET /api/dashboard/assets-by-status
GET /api/dashboard/assets-by-location
GET /api/dashboard/maintenance
```

---

# 12. Main Frontend Pages

The application will contain:

```text
/login
/dashboard
/assets
/assets/:id
/assets/create
/maintenance
/maintenance/:id
/inspections
/transfers
/locations
/users
/reports
```

---

# 13. Dashboard Design

The dashboard will provide a quick overview of the entire infrastructure inventory.

```text
---------------------------------------------------------
                 TRANSITASSET DASHBOARD
---------------------------------------------------------

Total Assets       Operational       Maintenance
   1,248              1,087              43

Inspections Due     Retired           Warranty Alerts
     27               73                  18

---------------------------------------------------------
Assets by Type
---------------------------------------------------------

Buses                 █████████████████
Electric Buses        █████████
CCTV                  ██████
Ticket Machines       █████
Charging Stations     ████

---------------------------------------------------------
Action Required
---------------------------------------------------------

⚠ 8 inspections due
⚠ 4 critical maintenance issues
⚠ 6 warranties expiring
⚠ 2 pending transfers
```

---

# 14. Primary Demo Scenario

The main demonstration should follow one asset through its lifecycle.

### Asset

```text
BUS-104
Electric Bus
Central Depot
Operational
```

### Step 1 — Report issue

A depot manager reports:

```text
Battery performance issue
Priority: High
```

### Step 2 — Maintenance

The system creates a maintenance request.

```text
Status: OPEN
```

A technician is assigned.

```text
Status: ASSIGNED
```

Then:

```text
IN_PROGRESS
```

### Step 3 — Complete repair

Technician enters:

```text
Diagnosis
Repair performed
Maintenance cost
Completion date
```

Status becomes:

```text
COMPLETED
```

The asset returns to:

```text
OPERATIONAL
```

### Step 4 — Transfer

The manager transfers the bus:

```text
Central Depot → North Depot
```

### Step 5 — View lifecycle

The asset page shows:

```text
Procured
↓
Registered
↓
Central Depot
↓
Operational
↓
Maintenance
↓
Repaired
↓
Operational
↓
North Depot
```

This single demonstration showcases the central concept of TransitAsset.

---

# 15. MVP vs Future Scope

## MVP — Hackathon

The minimum working system will include:

- Authentication
- Role-based access
- Asset registry
- Locations
- Asset lifecycle
- Asset transfers
- Inspections
- Maintenance
- Dashboard
- Search/filter
- Lifecycle history
- Alerts

## Future Enhancements

Potential future features include:

- IoT-based asset monitoring
- GPS integration
- Real-time vehicle telemetry
- Predictive maintenance
- AI-based failure prediction
- Mobile application
- QR/NFC asset scanning
- Automated procurement workflows
- GIS/map-based asset visualization
- Digital document storage
- Advanced financial analytics
- Multi-authority support
- Integration with existing government transport systems

---

# 16. Project Architecture

```text
                    ┌────────────────────┐
                    │      React UI      │
                    │   Tailwind CSS     │
                    └─────────┬──────────┘
                              │
                         REST APIs
                              │
                    ┌─────────▼──────────┐
                    │   Node.js /        │
                    │     Express        │
                    ├────────────────────┤
                    │ Authentication     │
                    │ Asset Management    │
                    │ Lifecycle Engine   │
                    │ Maintenance        │
                    │ Inspection         │
                    │ Transfer           │
                    │ Analytics          │
                    └─────────┬──────────┘
                              │
                         SQL Queries
                              │
                    ┌─────────▼──────────┐
                    │       MySQL        │
                    │                    │
                    │ Users              │
                    │ Assets             │
                    │ Locations          │
                    │ Lifecycle          │
                    │ Maintenance        │
                    │ Inspections        │
                    │ Transfers          │
                    └────────────────────┘
```

---

# 17. Success Criteria

TransitAsset should successfully demonstrate that a transport authority can:

1. Register a physical asset.
2. Identify where the asset is located.
3. Identify who is responsible for it.
4. Track its operational condition.
5. Record inspections.
6. Create and resolve maintenance requests.
7. Transfer the asset between locations.
8. Maintain a complete lifecycle history.
9. Identify assets requiring attention.
10. View the overall infrastructure inventory through a dashboard.

The project should therefore demonstrate **end-to-end asset visibility rather than simple inventory storage**.

---

# 18. Core Value Proposition

TransitAsset transforms fragmented physical-asset information into a **centralized, traceable, lifecycle-aware infrastructure inventory**.

Instead of asking:

> “Where is this asset and what is happening to it?”

the authority can answer:

> **“What is the asset, where is it, who owns it, what condition is it in, what has happened to it, what maintenance has it received, and what action is required next?”**

---

# 19. Project Tagline

> **TransitAsset — Track Every Asset. Manage Every Lifecycle.**
