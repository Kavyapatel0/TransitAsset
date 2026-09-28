# TransitAsset — System Architecture

## Overview

TransitAsset is a three-tier web application built to manage public transport infrastructure assets throughout their complete lifecycle.

The architecture follows a **modular monolith** pattern prioritizing:

- Clear separation of concerns
- Role-based security
- Transaction integrity
- Auditability
- Scalability
- Operational usability

---

## Architecture Diagram

```text
┌────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React.js Frontend                        │  │
│  │  • React Router (routing)                            │  │
│  │  • Tailwind CSS (styling)                            │  │
│  │  • Axios (HTTP client)                               │  │
│  │  • Context API (state)                               │  │
│  │  • Chart.js/Recharts (analytics)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                     REST APIs
                   (JSON over HTTP)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Node.js + Express.js Backend               │  │
│  │                                                       │  │
│  │  Routes → Controllers → Services → Repositories      │  │
│  │                                                       │  │
│  │  • Authentication (JWT)                              │  │
│  │  • Authorization (Role-based)                        │  │
│  │  • Business Logic Layer                              │  │
│  │  • Lifecycle Engine                                  │  │
│  │  • Transaction Management                            │  │
│  │  • Validation                                        │  │
│  │  • Error Handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                      SQL Queries
                 (Parameterized/Prepared)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                     PERSISTENCE LAYER                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MySQL Database                     │  │
│  │                                                       │  │
│  │  • Relational schema                                 │  │
│  │  • Foreign key constraints                           │  │
│  │  • Indexes                                           │  │
│  │  • Transaction support                               │  │
│  │  • Audit logging                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React.js | Component-based UI |
| Styling | Tailwind CSS | Utility-first CSS |
| Routing | React Router | Client-side routing |
| HTTP Client | Axios | API communication |
| State Management | Context API | Authentication state |
| Charts | Chart.js / Recharts | Data visualization |
| Build Tool | Vite | Fast development builds |

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web application framework |
| Authentication | JWT | Stateless authentication |
| Password Hashing | bcrypt | Secure password storage |
| Validation | express-validator | Input validation |
| Database Client | mysql2 | MySQL driver |
| Environment | dotenv | Configuration management |

### Database

| Component | Technology | Purpose |
|-----------|-----------|---------|
| RDBMS | MySQL 8.0+ | Relational data storage |
| Schema Management | SQL scripts | Version-controlled schema |

### Development Tools

- Git/GitHub (version control)
- VS Code (IDE)
- Postman (API testing)
- MySQL Workbench (database management)

---

## System Components

### 1. Frontend Application

**Location:** `/frontend`

**Purpose:** User interface for all user roles

**Key Features:**
- Responsive design (desktop-first)
- Role-based UI rendering
- Protected routes
- Form validation
- Loading states
- Error handling
- Real-time dashboard updates

**Directory Structure:**
```text
frontend/src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── layouts/         # Layout wrappers
├── routes/          # Route definitions
├── services/        # API service layer
├── hooks/           # Custom React hooks
├── context/         # React context providers
├── utils/           # Helper functions
├── constants/       # Application constants
└── charts/          # Chart components
```

---

### 2. Backend Application

**Location:** `/backend`

**Purpose:** Business logic, API endpoints, authentication, authorization

**Architecture Pattern:** Layered architecture

```text
Request Flow:

HTTP Request
     ↓
Route Handler
     ↓
Authentication Middleware
     ↓
Authorization Middleware
     ↓
Validation Middleware
     ↓
Controller (orchestration)
     ↓
Service (business logic)
     ↓
Repository (data access)
     ↓
MySQL Database
     ↓
Response
```

**Directory Structure:**
```text
backend/src/
├── config/          # Database, JWT configuration
├── controllers/     # Request/response handling
├── routes/          # API route definitions
├── services/        # Business logic
├── repositories/    # Data access layer
├── middleware/      # Auth, validation, error handling
├── validators/      # Input validation rules
├── utils/           # Helper functions
├── jobs/            # Background jobs (future)
├── app.js           # Express application
└── server.js        # Server entry point
```

**Key Responsibilities:**
- JWT token generation and validation
- Role-based access control
- Input validation
- Business rule enforcement
- Transaction management
- Audit logging
- Error handling

---

### 3. Database

**Location:** `/database`

**Purpose:** Persistent data storage

**Key Features:**
- Normalized relational schema
- Foreign key constraints
- Unique constraints
- Indexed columns
- Transaction support
- Audit trail

**Files:**
- `schema.sql` — Complete database structure
- `seed.sql` — Initial test data
- `indexes.sql` — Performance indexes
- `README.md` — Database documentation

---

## Core Modules

### Authentication & Authorization

**Authentication:**
- JWT-based stateless authentication
- Password hashing using bcrypt
- Token expiration (configurable)
- Protected API endpoints

**Authorization:**
- Role-based access control (RBAC)
- Three primary roles:
  - `ADMIN` — Full system access
  - `DEPOT_MANAGER` — Depot-scoped access
  - `TECHNICIAN` — Maintenance-focused access

**Middleware:**
- `auth.middleware.js` — Token validation
- `role.middleware.js` — Permission checking

---

### Asset Lifecycle Engine

**Purpose:** The core business logic module that enforces lifecycle state transitions.

**Lifecycle States:**
```text
PROCURED → REGISTERED → ASSIGNED → OPERATIONAL ⇄ 
UNDER_INSPECTION ⇄ UNDER_MAINTENANCE → TRANSFERRED → RETIRED
```

**Responsibilities:**
- Validate state transitions
- Prevent invalid transitions (e.g., RETIRED → OPERATIONAL)
- Create lifecycle history records
- Update asset status
- Maintain audit trail
- Execute in transactions

**Business Rules:**
- RETIRED assets cannot be transferred or assigned
- UNDER_MAINTENANCE assets cannot be marked OPERATIONAL without completion
- Every transition must be logged
- User and timestamp must be recorded
- Reason must be provided for major transitions

---

### Maintenance Management

**Workflow:**
```text
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
```

**Features:**
- Issue reporting
- Technician assignment
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Diagnosis and resolution tracking
- Cost tracking
- Parts/services tracking
- Completion workflow

**Integration:**
- Updates asset status to UNDER_MAINTENANCE
- Returns asset to OPERATIONAL upon completion
- Creates lifecycle history entry
- Generates audit log

---

### Transfer Management

**Workflow:**
```text
REQUESTED → APPROVED → IN_TRANSIT → COMPLETED
```

**Features:**
- Request creation
- Approval workflow
- Location update
- Transfer history

**Transaction:**
When transfer completes:
1. Update transfer status
2. Update asset current_location_id
3. Create lifecycle event
4. Create audit log

All operations must succeed or fail atomically.

---

### Inspection Management

**Features:**
- Schedule inspections
- Record inspection results (PASS, FAIL, REQUIRES_ATTENTION)
- Update asset condition (EXCELLENT, GOOD, FAIR, POOR, CRITICAL)
- Set next inspection date
- Track inspection history

---

### Dashboard & Analytics

**Purpose:** Management visibility into asset inventory and operations

**Key Metrics:**
- Total assets
- Assets by status
- Assets by location
- Assets by condition
- Maintenance statistics
- Inspection statistics
- Warranty alerts

**Visualizations:**
- Asset distribution charts
- Status breakdown
- Location distribution
- Condition analysis
- Maintenance trends

---

## Data Flow Examples

### Example 1: User Login

```text
1. User submits credentials → /api/auth/login
2. Backend validates credentials (bcrypt)
3. JWT token generated
4. Token returned to frontend
5. Frontend stores token (memory/sessionStorage)
6. Subsequent requests include token in Authorization header
7. Backend middleware validates token
8. Request proceeds if valid
```

### Example 2: Asset Creation

```text
1. Admin fills asset form
2. Frontend validates input
3. POST /api/assets with asset data
4. Backend validates input
5. Backend checks permissions
6. Service creates asset record
7. Initial lifecycle record created (PROCURED)
8. Audit log created
9. Response returned with asset ID
10. Frontend redirects to asset details
```

### Example 3: Maintenance Completion

```text
1. Technician marks maintenance complete
2. PUT /api/maintenance/:id with completion data
3. Backend validates technician authorization
4. Begin MySQL transaction:
   a. Update maintenance status → COMPLETED
   b. Update asset status → OPERATIONAL
   c. Update asset.last_maintenance_date
   d. Create lifecycle event
   e. Create audit log
5. Commit transaction
6. Return success response
7. Frontend refreshes asset details
```

### Example 4: Asset Transfer

```text
1. Manager creates transfer request
2. POST /api/transfers with from/to locations
3. Backend validates:
   - Asset exists
   - Asset not RETIRED
   - Locations valid
   - User authorized
4. Transfer created with status REQUESTED
5. Admin approves transfer
6. PUT /api/transfers/:id with status APPROVED
7. Manager completes transfer
8. PUT /api/transfers/:id with status COMPLETED
9. Begin transaction:
   a. Update transfer status
   b. Update asset.current_location_id
   c. Create lifecycle event (TRANSFERRED)
   d. Create audit log
10. Commit transaction
```

---

## Security Architecture

### 1. Authentication Security

- Passwords hashed with bcrypt (salt rounds: 10+)
- JWT tokens with expiration
- Token stored client-side (not in localStorage for production)
- HTTPS enforced in production

### 2. Authorization Security

- Role-based access control
- Permission checks at API level (not just UI)
- Middleware enforcement
- Resource ownership validation

### 3. Input Validation

- Frontend validation (UX)
- **Backend validation (security)**
- express-validator for input sanitization
- SQL injection prevention (parameterized queries)

### 4. API Security

- CORS configuration
- Rate limiting (future)
- Helmet security headers (future)
- Error messages don't expose sensitive data

### 5. Database Security

- Prepared statements / parameterized queries
- Foreign key constraints
- No raw SQL from user input
- Database credentials in environment variables

---

## Scalability Considerations

### Current Architecture (MVP)

- Monolithic application
- Single MySQL database
- Suitable for 1,000–10,000 assets

### Future Scaling Options

**Horizontal Scaling:**
- Load balancer + multiple backend instances
- Stateless architecture (JWT) supports this

**Database Scaling:**
- Read replicas for reporting
- Index optimization
- Query optimization
- Partitioning for large tables

**Caching:**
- Redis for session/dashboard data
- CDN for static assets

**Microservices (Long-term):**
- Asset Service
- Lifecycle Service
- Maintenance Service
- Transfer Service
- Analytics Service

---

## Error Handling Strategy

### API Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "User-friendly error message"
}
```

### Error Types

1. **Validation Errors** (400)
   - Missing required fields
   - Invalid data format
   - Business rule violations

2. **Authentication Errors** (401)
   - Invalid credentials
   - Expired token
   - Missing token

3. **Authorization Errors** (403)
   - Insufficient permissions
   - Resource access denied

4. **Not Found Errors** (404)
   - Asset not found
   - Route not found

5. **Server Errors** (500)
   - Database errors
   - Unexpected exceptions

### Frontend Error Handling

- Global error boundary
- Toast notifications
- Inline form errors
- Network error handling
- Loading states

---

## Transaction Management

### Critical Operations Requiring Transactions

1. **Maintenance Completion:**
   - Update maintenance record
   - Update asset status
   - Create lifecycle event
   - Create audit log

2. **Transfer Completion:**
   - Update transfer record
   - Update asset location
   - Create lifecycle event
   - Create audit log

3. **Asset Retirement:**
   - Update asset status
   - Create lifecycle event
   - Create audit log
   - Update dependent records

### Implementation

```javascript
// Pseudo-code
async function completeTransfer(transferId, userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Update transfer
    await updateTransferStatus(transferId, 'COMPLETED', connection);
    
    // Update asset location
    const transfer = await getTransfer(transferId, connection);
    await updateAssetLocation(transfer.asset_id, transfer.to_location_id, connection);
    
    // Create lifecycle event
    await createLifecycleEvent({
      asset_id: transfer.asset_id,
      event_type: 'TRANSFERRED',
      performed_by: userId
    }, connection);
    
    // Create audit log
    await createAuditLog({
      action: 'TRANSFER_COMPLETED',
      entity_id: transferId,
      user_id: userId
    }, connection);
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

---

## Deployment Architecture

### Development Environment

```text
Frontend: localhost:5173 (Vite dev server)
Backend: localhost:5000 (Node.js)
Database: localhost:3306 (MySQL)
```

### Production Environment (Example)

```text
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│  Frontend   │  (Netlify/Vercel/S3)
│  (Static)   │
└──────┬──────┘
       │
       │ REST API (HTTPS)
       ▼
┌─────────────┐
│   Backend   │  (Heroku/AWS/DigitalOcean)
│  (Node.js)  │
└──────┬──────┘
       │
       │ SQL
       ▼
┌─────────────┐
│   MySQL     │  (AWS RDS/PlanetScale)
│  Database   │
└─────────────┘
```

---

## Monitoring & Observability (Future)

### Logging

- Application logs (Winston/Pino)
- Access logs
- Error logs
- Audit logs (database)

### Metrics

- API response times
- Database query performance
- Error rates
- Active users

### Alerts

- Service downtime
- High error rates
- Database connection issues
- Disk space warnings

---

## Development Workflow

### Branch Strategy

```text
main (production)
 └── develop (integration)
      └── feature/* (development)
```

### Commit Convention

```text
feat: add asset transfer module
fix: correct lifecycle transition validation
docs: update API documentation
refactor: improve service layer structure
test: add maintenance workflow tests
```

### Code Review Checklist

- [ ] Code follows project structure
- [ ] Business logic in service layer
- [ ] Authorization checks present
- [ ] Input validation present
- [ ] Transactions used where needed
- [ ] Error handling implemented
- [ ] Tests included
- [ ] Documentation updated

---

## Future Enhancements

### Phase 2 (Post-MVP)

- Mobile application (React Native)
- Real-time notifications (WebSocket)
- Advanced analytics
- Document upload (S3/cloud storage)
- QR code asset scanning
- Bulk operations
- Export to Excel/PDF

### Phase 3 (Long-term)

- IoT integration (GPS, telemetry)
- Predictive maintenance (ML)
- GIS/map visualization
- Multi-tenant support
- Integration APIs
- Advanced reporting
- Mobile-first redesign

---

## Conclusion

TransitAsset's architecture prioritizes:

1. **Correctness** — Business rules enforced at backend
2. **Security** — Authentication, authorization, validation
3. **Maintainability** — Clear separation of concerns
4. **Auditability** — Complete lifecycle and audit history
5. **Scalability** — Foundation for future growth
6. **Usability** — Clean, responsive user interface

The modular monolith approach provides a solid foundation for an MVP while allowing future evolution toward microservices or enhanced features as requirements grow.
