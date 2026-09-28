# TransitAsset — Business Workflows

## Overview

This document describes the key business workflows in TransitAsset.

Each workflow represents a real operational process in public transport infrastructure asset management.

---

## Workflow 1: Asset Registration & Deployment

### Objective
Register a newly procured asset and deploy it to operational service.

### Actors
- System Administrator
- Depot Manager

### Preconditions
- Asset physically received
- Purchase documentation available
- Location identified

### Steps

1. **Asset Procurement** (External)
   - Government procures asset from manufacturer
   - Asset delivered to depot

2. **Asset Registration** (Admin)
   ```
   POST /api/assets
   ```
   - Enter asset details:
     - Asset code
     - Type and category
     - Serial number
     - Registration number
     - Manufacturer and model
     - Purchase information
     - Warranty information
   - Assign location
   - Assign department
   - Assign custodian
   - Status: PROCURED

3. **Asset Verification** (Depot Manager)
   - Physical verification
   - Documentation check
   - Initial inspection

4. **Status Update to REGISTERED** (Admin)
   ```
   POST /api/assets/:id/lifecycle
   ```
   - Change status: PROCURED → REGISTERED
   - Reason: "Asset verified and registered"
   - Lifecycle event created

5. **Location Assignment** (Admin)
   ```
   PUT /api/assets/:id
   ```
   - Assign to specific depot
   - Update current_location_id

6. **Status Update to ASSIGNED** (Admin)
   ```
   POST /api/assets/:id/lifecycle
   ```
   - Change status: REGISTERED → ASSIGNED
   - Reason: "Assigned to Central Depot"

7. **Operational Deployment** (Depot Manager)
   - Complete operational setup
   - Staff training (if required)
   - Integration with existing systems

8. **Status Update to OPERATIONAL** (Admin/Manager)
   ```
   POST /api/assets/:id/lifecycle
   ```
   - Change status: ASSIGNED → OPERATIONAL
   - Reason: "Asset deployed to operational service"

### Postconditions
- Asset available for operational use
- Complete lifecycle history recorded
- Asset visible in dashboard

### Business Rules
- Asset code must be unique
- Warranty dates must be valid
- Location must exist
- Each status transition creates lifecycle event

---

## Workflow 2: Maintenance Request & Resolution

### Objective
Report, diagnose, and resolve asset maintenance issue.

### Actors
- Depot Manager (Reporter)
- System Administrator
- Maintenance Technician

### Preconditions
- Asset exists and is registered
- Asset is not RETIRED

### Steps

1. **Issue Identification** (Depot Manager/Operator)
   - Asset malfunction detected
   - Operational issue observed

2. **Create Maintenance Request** (Depot Manager)
   ```
   POST /api/maintenance
   ```
   - Select asset
   - Enter issue title
   - Describe problem
   - Set priority (LOW, MEDIUM, HIGH, CRITICAL)
   - Status: OPEN

3. **Assign Technician** (Admin)
   ```
   PUT /api/maintenance/:id
   ```
   - Select qualified technician
   - Schedule maintenance
   - Status: OPEN → ASSIGNED

4. **Asset Status Update** (System)
   ```
   PUT /api/assets/:id
   ```
   - Asset status: OPERATIONAL → UNDER_MAINTENANCE
   - Lifecycle event created

5. **Start Maintenance** (Technician)
   ```
   PUT /api/maintenance/:id
   ```
   - Begin work
   - Status: ASSIGNED → IN_PROGRESS
   - Record started_at timestamp

6. **Diagnosis** (Technician)
   ```
   PUT /api/maintenance/:id
   ```
   - Identify root cause
   - Record diagnosis
   - Determine required parts/services

7. **Perform Repair** (Technician)
   - Execute repair work
   - Replace parts if needed
   - Test functionality

8. **Complete Maintenance** (Technician)
   ```
   PUT /api/maintenance/:id/complete
   ```
   - Enter resolution details
   - Record maintenance cost
   - List parts/services used
   - Add remarks
   - Status: IN_PROGRESS → COMPLETED

9. **Asset Status Update** (System - Transaction)
   ```
   BEGIN TRANSACTION
   - Update maintenance status → COMPLETED
   - Update asset status → OPERATIONAL
   - Update asset.last_maintenance_date
   - Create lifecycle event
   - Create audit log
   COMMIT
   ```

10. **Verification** (Depot Manager)
    - Test asset operation
    - Confirm repair quality
    - Return to service

### Postconditions
- Asset returned to operational status
- Maintenance cost recorded
- Complete maintenance history available
- Lifecycle history updated
- Dashboard metrics updated

### Business Rules
- Asset under maintenance cannot be marked operational without completion
- Maintenance completion requires resolution details
- Cost must be recorded for completed maintenance
- Transaction ensures data consistency

### Exception Flows

**Maintenance Cancelled:**
```
PUT /api/maintenance/:id
Status: CANCELLED
Reason: "Issue resolved without intervention"
Asset status: Return to previous status
```

**Technician Reassignment:**
```
PUT /api/maintenance/:id
assigned_technician: <new_technician_id>
```

---

## Workflow 3: Asset Inspection

### Objective
Perform periodic inspection and update asset condition.

### Actors
- Inspector (Technician/Manager)
- System Administrator

### Preconditions
- Asset exists
- Asset is not RETIRED
- Inspection due or scheduled

### Steps

1. **Inspection Scheduling** (Manager)
   - Identify assets due for inspection
   - Check next_inspection_date
   - Plan inspection schedule

2. **Asset Status Update** (Optional)
   ```
   POST /api/assets/:id/lifecycle
   ```
   - Status: OPERATIONAL → UNDER_INSPECTION

3. **Conduct Physical Inspection** (Inspector)
   - Visual examination
   - Operational testing
   - Safety checks
   - Documentation review

4. **Record Inspection** (Inspector)
   ```
   POST /api/inspections
   ```
   - Select asset
   - Enter inspection_date
   - Set result: PASS / FAIL / REQUIRES_ATTENTION
   - Set condition: EXCELLENT / GOOD / FAIR / POOR / CRITICAL
   - Record findings
   - Add recommendations
   - Set next_inspection_date

5. **Update Asset** (System)
   ```
   PUT /api/assets/:id
   ```
   - Update condition
   - Update last_inspection_date
   - Update next_inspection_date
   - Create lifecycle event

6. **Follow-up Actions** (Conditional)
   
   **If Result = PASS:**
   - Return asset to OPERATIONAL
   - No immediate action required

   **If Result = REQUIRES_ATTENTION:**
   - Create maintenance request
   - Schedule follow-up inspection

   **If Result = FAIL:**
   - Create CRITICAL maintenance request
   - Asset status: UNDER_MAINTENANCE
   - Immediate action required

7. **Asset Status Restoration**
   ```
   POST /api/assets/:id/lifecycle
   ```
   - Status: UNDER_INSPECTION → OPERATIONAL (if passed)

### Postconditions
- Asset condition updated
- Inspection history recorded
- Next inspection scheduled
- Maintenance created if needed
- Alert generated if condition poor/critical

### Business Rules
- Inspection updates asset condition
- Failed inspection triggers maintenance
- Next inspection date must be set
- Inspection history is immutable

---

## Workflow 4: Asset Transfer Between Locations

### Objective
Transfer asset from one depot/location to another.

### Actors
- Depot Manager (Requester)
- System Administrator (Approver)
- Depot Manager (Receiver)

### Preconditions
- Asset exists and is OPERATIONAL
- Asset not RETIRED
- Asset not involved in active transfer
- Source and destination locations exist
- Source ≠ Destination

### Steps

1. **Identify Transfer Need** (Manager)
   - Depot rebalancing required
   - Demand analysis
   - Operational optimization

2. **Create Transfer Request** (Depot Manager)
   ```
   POST /api/transfers
   ```
   - Select asset
   - from_location_id: Current location
   - to_location_id: Destination location
   - Enter reason
   - Status: REQUESTED

3. **Review Transfer Request** (Admin)
   ```
   GET /api/transfers/:id
   ```
   - Review asset details
   - Verify locations
   - Check operational impact
   - Verify asset availability

4. **Approve or Reject Transfer** (Admin)
   
   **Approve:**
   ```
   PUT /api/transfers/:id/approve
   ```
   - Status: REQUESTED → APPROVED
   - Notification to both depots

   **Reject:**
   ```
   PUT /api/transfers/:id/reject
   ```
   - Status: REQUESTED → REJECTED
   - Reason recorded

5. **Initiate Physical Transfer** (Source Depot)
   ```
   PUT /api/transfers/:id
   ```
   - Status: APPROVED → IN_TRANSIT
   - Asset prepared for movement
   - Documentation prepared

6. **Physical Transport** (Logistics)
   - Asset moved from source to destination
   - Transport documentation
   - Safety procedures

7. **Receive Asset** (Destination Depot)
   - Physical verification
   - Documentation check
   - Condition assessment

8. **Complete Transfer** (Admin/Destination Manager)
   ```
   PUT /api/transfers/:id/complete
   ```
   - Status: IN_TRANSIT → COMPLETED
   - Transfer_date recorded

9. **System Updates** (Transaction)
   ```
   BEGIN TRANSACTION
   - Update transfer status → COMPLETED
   - Update asset.current_location_id → to_location_id
   - Create lifecycle event (TRANSFERRED)
   - Create audit log
   COMMIT
   ```

10. **Post-Transfer Activities** (Destination Depot)
    - Integration into local operations
    - Staff briefing
    - Operational deployment

### Postconditions
- Asset location updated
- Transfer history recorded
- Lifecycle history updated
- Dashboard reflects new location
- Both depots notified

### Business Rules
- RETIRED assets cannot be transferred
- Source and destination must be different
- Asset can have only one active transfer
- Transfer completion is atomic (transaction)
- Transfer creates lifecycle event

### Exception Flows

**Transfer Cancelled:**
```
Status: IN_TRANSIT → REJECTED
Reason: "Operational priority changed"
Asset location: Remains at source
```

**Transfer Delayed:**
```
Status: Remains IN_TRANSIT
Remarks: Updated with delay reason
```

---

## Workflow 5: Asset Retirement

### Objective
Permanently retire asset from operational service.

### Actors
- System Administrator

### Preconditions
- Asset exists
- Asset not already RETIRED
- Proper authorization obtained

### Steps

1. **Retirement Decision** (Management)
   - Asset reached end of life
   - Asset beyond economical repair
   - Asset obsolete
   - Policy decision

2. **Pre-Retirement Actions**
   - Complete pending maintenance (if any)
   - Complete pending transfers (if any)
   - Final inspection (optional)
   - Documentation review

3. **Retire Asset** (Admin)
   ```
   POST /api/assets/:id/lifecycle
   ```
   - new_status: RETIRED
   - Reason: "End of operational life"
   - Enter retirement details

4. **System Updates** (Transaction)
   ```
   BEGIN TRANSACTION
   - Update asset status → RETIRED
   - Create lifecycle event
   - Create audit log
   - Cancel pending operations
   COMMIT
   ```

5. **Physical Asset Handling**
   - Remove from operational location
   - Storage or disposal
   - Documentation archived

6. **Record Keeping**
   - Asset remains in database
   - Complete history preserved
   - Available for historical reporting

### Postconditions
- Asset status = RETIRED
- Asset no longer appears in operational dashboards
- Historical data preserved
- Cannot be transferred or assigned
- Cannot create new maintenance

### Business Rules
- RETIRED is final status (cannot be reversed without admin intervention)
- RETIRED assets excluded from operational reports
- RETIRED assets cannot be transferred
- RETIRED assets cannot receive new maintenance
- Historical data must be preserved

---

## Workflow 6: Dashboard Monitoring & Alert Response

### Objective
Monitor asset inventory and respond to system alerts.

### Actors
- Depot Manager
- System Administrator
- Maintenance Technician

### Steps

1. **Dashboard Access** (User)
   ```
   GET /api/dashboard/summary
   ```
   - View key metrics
   - Check operational status
   - Review alerts

2. **Alert Review** (Manager/Admin)
   ```
   GET /api/alerts
   ```
   - View active alerts
   - Sort by severity
   - Filter by type

3. **Alert Types & Responses**

   **Maintenance Due (HIGH/CRITICAL):**
   ```
   Action: Create maintenance request immediately
   POST /api/maintenance
   ```

   **Inspection Overdue (HIGH):**
   ```
   Action: Schedule inspection
   POST /api/inspections (backdated if needed)
   ```

   **Warranty Expiring (WARNING):**
   ```
   Action: Review maintenance strategy
   Consider: Extended warranty or service contract
   ```

   **Warranty Expired (INFO):**
   ```
   Action: Update procurement/maintenance budget
   ```

   **Poor/Critical Condition (CRITICAL):**
   ```
   Action: Immediate inspection
   Create maintenance request
   Consider retirement if economically unviable
   ```

   **Pending Transfer (INFO):**
   ```
   Action: Review and approve/reject
   PUT /api/transfers/:id/approve
   ```

4. **Mark Alert as Read** (User)
   ```
   PUT /api/alerts/:id/read
   ```

5. **Take Corrective Action**
   - Create required requests
   - Assign resources
   - Schedule activities
   - Update asset information

6. **Verification** (Manager)
   - Confirm action taken
   - Verify alert resolution
   - Monitor dashboard updates

### Postconditions
- Alerts addressed
- Required actions initiated
- Dashboard reflects current state
- Operational risks mitigated

---

## Workflow 7: Reporting & Analytics

### Objective
Generate reports for management decision-making.

### Actors
- System Administrator
- Depot Manager
- Management

### Report Types

### 1. Asset Inventory Report

```
GET /api/assets?<filters>
```

**Filters:**
- Location
- Department
- Category
- Status
- Condition
- Ownership

**Output:**
- Complete asset list with details
- Export to CSV

**Use Cases:**
- Audit compliance
- Insurance documentation
- Procurement planning

---

### 2. Maintenance Report

```
GET /api/maintenance?start_date=X&end_date=Y
```

**Filters:**
- Date range
- Asset type
- Priority
- Status
- Location

**Metrics:**
- Total maintenance requests
- Average resolution time
- Total maintenance cost
- Cost by asset type
- Technician workload

**Use Cases:**
- Budget planning
- Resource allocation
- Maintenance strategy optimization

---

### 3. Inspection Report

```
GET /api/inspections?start_date=X&end_date=Y
```

**Metrics:**
- Inspections completed
- Pass/fail rate
- Condition distribution
- Overdue inspections
- Inspection frequency

**Use Cases:**
- Compliance reporting
- Asset health monitoring
- Inspection schedule optimization

---

### 4. Transfer Report

```
GET /api/transfers?start_date=X&end_date=Y
```

**Metrics:**
- Transfers completed
- Average transfer time
- Transfers by location
- Asset mobility patterns

**Use Cases:**
- Operations optimization
- Location capacity planning
- Asset utilization analysis

---

### 5. Lifecycle Report (Per Asset)

```
GET /api/assets/:id/lifecycle
```

**Output:**
- Complete historical timeline
- All status transitions
- All maintenance events
- All inspections
- All transfers

**Use Cases:**
- Asset history verification
- Accountability tracking
- Lifecycle analysis

---

### 6. Financial Report

**Metrics:**
- Total asset value (purchase cost)
- Maintenance cost by period
- Maintenance cost by asset type
- Cost per asset
- Warranty savings

**Use Cases:**
- Budget planning
- Cost optimization
- ROI analysis

---

## Workflow 8: User Management

### Objective
Manage system users and permissions.

### Actors
- System Administrator

### Steps

1. **Create User** (Admin)
   ```
   POST /api/users
   ```
   - Enter user details
   - Assign role (ADMIN, DEPOT_MANAGER, TECHNICIAN)
   - Assign department
   - Assign location (for depot managers)
   - Set initial password

2. **User Login** (User)
   ```
   POST /api/auth/login
   ```
   - Enter credentials
   - Receive JWT token
   - Access granted based on role

3. **Update User** (Admin)
   ```
   PUT /api/users/:id
   ```
   - Update details
   - Change role
   - Change assignment

4. **Deactivate User** (Admin)
   ```
   PUT /api/users/:id
   ```
   - Status: INACTIVE
   - User cannot login
   - Historical records preserved

5. **Password Reset** (Admin/User)
   - Generate reset token
   - User sets new password

### Postconditions
- User access granted/revoked
- Permissions enforced
- Audit trail maintained

---

## Business Rule Summary

### Asset Lifecycle Rules

1. **Status Transitions**
   - Must follow valid state machine
   - Cannot transition RETIRED to any other status
   - UNDER_MAINTENANCE requires active maintenance request

2. **One Location**
   - Asset has exactly one current_location_id
   - Transfer completion atomically updates location

3. **History Preservation**
   - Every transition creates lifecycle event
   - Lifecycle events immutable
   - Lifecycle events never deleted

### Maintenance Rules

1. **Status Workflow**
   - OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
   - Cannot skip states

2. **Asset Integration**
   - IN_PROGRESS sets asset to UNDER_MAINTENANCE
   - COMPLETED returns asset to OPERATIONAL
   - Must use transaction

3. **Completion Requirements**
   - Resolution required
   - Cost should be recorded
   - Parts/services documented

### Inspection Rules

1. **Condition Update**
   - Inspection updates asset condition
   - Failed inspection triggers maintenance
   - Next inspection date required

2. **Schedule Compliance**
   - System generates alerts for overdue inspections
   - Regular inspection interval recommended

### Transfer Rules

1. **Validation**
   - Source ≠ Destination
   - Asset not RETIRED
   - No active transfer exists

2. **Completion**
   - Atomic transaction
   - Location updated
   - Lifecycle event created

3. **Approval**
   - Admin approval required
   - Approval workflow enforced

---

## Conclusion

TransitAsset workflows ensure:

1. **Traceability** — Complete audit trail for every operation
2. **Consistency** — Business rules enforced through transactions
3. **Accountability** — Every action attributed to a user
4. **Compliance** — Structured processes for inspections and maintenance
5. **Visibility** — Real-time dashboard and alert system

All workflows are designed to reflect real-world public transport infrastructure asset management operations.
