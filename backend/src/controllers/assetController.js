import { query, queryOne, transaction } from '../config/database.js';
import { success, error, notFound, validationError } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

const ASSET_SELECT = `
  SELECT a.*,
    l.name as location_name, l.type as location_type,
    d.name as department_name,
    CONCAT(u.name) as custodian_name,
    u.email as custodian_email
  FROM assets a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN departments d ON a.department_id = d.id
  LEFT JOIN users u ON a.custodian_id = u.id
`;

// Valid lifecycle transitions
const VALID_TRANSITIONS = {
    PROCURED: ['REGISTERED'],
    REGISTERED: ['ASSIGNED', 'RETIRED'],
    ASSIGNED: ['OPERATIONAL', 'REGISTERED', 'RETIRED'],
    OPERATIONAL: ['UNDER_INSPECTION', 'UNDER_MAINTENANCE', 'TRANSFERRED', 'RETIRED'],
    UNDER_INSPECTION: ['OPERATIONAL', 'UNDER_MAINTENANCE', 'RETIRED'],
    UNDER_MAINTENANCE: ['OPERATIONAL', 'RETIRED'],
    TRANSFERRED: ['OPERATIONAL'],
    RETIRED: []
};

export const getAssets = async (req, res) => {
    try {
        const {
            search, status, category, asset_type, condition, location_id, department_id,
            ownership_type, warranty, page = 1, limit = 20, sort = 'a.created_at', order = 'DESC'
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const allowedSorts = ['a.id', 'a.asset_code', 'a.name', 'a.status', 'a.condition', 'a.created_at', 'a.purchase_date', 'a.warranty_expiry'];
        const sortCol = allowedSorts.includes(sort) ? sort : 'a.created_at';
        const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let where = ['1=1'];
        let params = [];

        if (search) {
            where.push('(a.asset_code LIKE ? OR a.name LIKE ? OR a.serial_number LIKE ? OR a.registration_number LIKE ? OR a.manufacturer LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s, s, s, s);
        }
        if (status) { where.push('a.status = ?'); params.push(status); }
        if (category) { where.push('a.category = ?'); params.push(category); }
        if (asset_type) { where.push('a.asset_type = ?'); params.push(asset_type); }
        if (condition) { where.push('a.`condition` = ?'); params.push(condition); }
        if (location_id) { where.push('a.location_id = ?'); params.push(location_id); }
        if (department_id) { where.push('a.department_id = ?'); params.push(department_id); }
        if (ownership_type) { where.push('a.ownership_type = ?'); params.push(ownership_type); }
        if (warranty === 'expired') { where.push('a.warranty_expiry < CURDATE()'); }
        if (warranty === 'expiring') { where.push('a.warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)'); }
        if (warranty === 'active') { where.push('a.warranty_expiry >= CURDATE()'); }

        // DEPOT_MANAGER restriction
        if (req.user.role === 'DEPOT_MANAGER' && req.user.location_id) {
            where.push('a.location_id = ?');
            params.push(req.user.location_id);
        }

        const whereStr = where.join(' AND ');

        const [countResult] = await Promise.all([
            query(`SELECT COUNT(*) as total FROM assets a WHERE ${whereStr}`, params)
        ]);
        const total = countResult[0].total;

        const assets = await query(
            `${ASSET_SELECT} WHERE ${whereStr} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        return success(res, {
            assets,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to retrieve assets');
    }
};

export const getAsset = async (req, res) => {
    try {
        const asset = await queryOne(`${ASSET_SELECT} WHERE a.id = ?`, [req.params.id]);
        if (!asset) return notFound(res, 'Asset not found');

        // Lifecycle history
        const lifecycle = await query(
            `SELECT al.*, u.name as performed_by_name, l.name as location_name
       FROM asset_lifecycle al
       LEFT JOIN users u ON al.performed_by = u.id
       LEFT JOIN locations l ON al.location_id = l.id
       WHERE al.asset_id = ? ORDER BY al.created_at ASC`,
            [asset.id]
        );

        // Maintenance history
        const maintenance = await query(
            `SELECT mr.*, u1.name as reported_by_name, u2.name as technician_name
       FROM maintenance_requests mr
       LEFT JOIN users u1 ON mr.reported_by = u1.id
       LEFT JOIN users u2 ON mr.assigned_technician = u2.id
       WHERE mr.asset_id = ? ORDER BY mr.created_at DESC LIMIT 20`,
            [asset.id]
        );

        // Inspection history
        const inspections = await query(
            `SELECT i.*, u.name as inspector_name
       FROM inspections i
       LEFT JOIN users u ON i.inspector_id = u.id
       WHERE i.asset_id = ? ORDER BY i.inspection_date DESC LIMIT 20`,
            [asset.id]
        );

        // Transfer history
        const transfers = await query(
            `SELECT t.*, fl.name as from_location_name, tl.name as to_location_name,
              u1.name as requested_by_name, u2.name as approved_by_name
       FROM asset_transfers t
       LEFT JOIN locations fl ON t.from_location_id = fl.id
       LEFT JOIN locations tl ON t.to_location_id = tl.id
       LEFT JOIN users u1 ON t.requested_by = u1.id
       LEFT JOIN users u2 ON t.approved_by = u2.id
       WHERE t.asset_id = ? ORDER BY t.created_at DESC`,
            [asset.id]
        );

        // Documents
        const documents = await query(
            `SELECT d.*, u.name as uploaded_by_name FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.asset_id = ?`,
            [asset.id]
        );

        // Health score calculation
        const healthScore = calculateHealthScore(asset);

        return success(res, { asset, lifecycle, maintenance, inspections, transfers, documents, healthScore });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to retrieve asset');
    }
};

export const createAsset = async (req, res) => {
    try {
        const { asset_code, name, asset_type, category, serial_number, registration_number,
            manufacturer, model, purchase_date, purchase_cost, warranty_start, warranty_expiry,
            ownership_type, location_id, department_id, custodian_id, condition, fuel_type,
            seating_capacity, mileage, battery_capacity, vehicle_number, description } = req.body;

        if (!asset_code || !name || !asset_type || !category) {
            return validationError(res, [{ field: 'required', message: 'asset_code, name, asset_type, category are required' }]);
        }

        const existing = await queryOne('SELECT id FROM assets WHERE asset_code = ?', [asset_code]);
        if (existing) return error(res, `Asset code ${asset_code} already exists`, 409);

        if (serial_number) {
            const dupSerial = await queryOne('SELECT id FROM assets WHERE serial_number = ?', [serial_number]);
            if (dupSerial) return error(res, `Serial number ${serial_number} already used`, 409);
        }

        const result = await query(
            `INSERT INTO assets (asset_code, name, asset_type, category, serial_number, registration_number,
        manufacturer, model, purchase_date, purchase_cost, warranty_start, warranty_expiry,
        ownership_type, location_id, department_id, custodian_id, \`condition\`, fuel_type,
        seating_capacity, mileage, battery_capacity, vehicle_number, description, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'PROCURED')`,
            [asset_code, name, asset_type, category, serial_number || null, registration_number || null,
                manufacturer || null, model || null, purchase_date || null, purchase_cost || null,
                warranty_start || null, warranty_expiry || null, ownership_type || 'GOVERNMENT_OWNED',
                location_id || null, department_id || null, custodian_id || null, condition || 'GOOD',
                fuel_type || null, seating_capacity || null, mileage || null, battery_capacity || null,
                vehicle_number || null, description || null]
        );

        const assetId = result.insertId;

        // Create initial lifecycle event
        await query(
            `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, location_id, performed_by, reason)
       VALUES (?, NULL, 'PROCURED', 'PROCUREMENT', ?, ?, 'Asset registered in system')`,
            [assetId, location_id || null, req.user.id]
        );

        await auditLog(req.user.id, 'ASSET_CREATED', 'assets', assetId, null, { asset_code, name }, getClientIP(req));

        const asset = await queryOne(`${ASSET_SELECT} WHERE a.id = ?`, [assetId]);
        return success(res, { asset }, 'Asset created successfully', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to create asset');
    }
};

export const updateAsset = async (req, res) => {
    try {
        const asset = await queryOne('SELECT * FROM assets WHERE id = ?', [req.params.id]);
        if (!asset) return notFound(res, 'Asset not found');

        const { name, asset_type, category, serial_number, registration_number, manufacturer, model,
            purchase_date, purchase_cost, warranty_start, warranty_expiry, ownership_type,
            location_id, department_id, custodian_id, condition, fuel_type, seating_capacity,
            mileage, battery_capacity, vehicle_number, description } = req.body;

        if (serial_number && serial_number !== asset.serial_number) {
            const dup = await queryOne('SELECT id FROM assets WHERE serial_number = ? AND id != ?', [serial_number, asset.id]);
            if (dup) return error(res, 'Serial number already in use', 409);
        }

        await query(
            `UPDATE assets SET name=?, asset_type=?, category=?, serial_number=?, registration_number=?,
        manufacturer=?, model=?, purchase_date=?, purchase_cost=?, warranty_start=?, warranty_expiry=?,
        ownership_type=?, location_id=?, department_id=?, custodian_id=?, \`condition\`=?,
        fuel_type=?, seating_capacity=?, mileage=?, battery_capacity=?, vehicle_number=?, description=?
       WHERE id=?`,
            [name || asset.name, asset_type || asset.asset_type, category || asset.category,
            serial_number ?? asset.serial_number, registration_number ?? asset.registration_number,
            manufacturer ?? asset.manufacturer, model ?? asset.model, purchase_date ?? asset.purchase_date,
            purchase_cost ?? asset.purchase_cost, warranty_start ?? asset.warranty_start,
            warranty_expiry ?? asset.warranty_expiry, ownership_type || asset.ownership_type,
            location_id ?? asset.location_id, department_id ?? asset.department_id,
            custodian_id ?? asset.custodian_id, condition || asset.condition,
            fuel_type ?? asset.fuel_type, seating_capacity ?? asset.seating_capacity,
            mileage ?? asset.mileage, battery_capacity ?? asset.battery_capacity,
            vehicle_number ?? asset.vehicle_number, description ?? asset.description, asset.id]
        );

        await auditLog(req.user.id, 'ASSET_UPDATED', 'assets', asset.id, asset, req.body, getClientIP(req));
        const updated = await queryOne(`${ASSET_SELECT} WHERE a.id = ?`, [asset.id]);
        return success(res, { asset: updated }, 'Asset updated successfully');
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to update asset');
    }
};

export const changeAssetStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_status, reason, remarks, location_id } = req.body;

        if (!new_status || !reason) return validationError(res, [{ message: 'new_status and reason are required' }]);

        const asset = await queryOne('SELECT * FROM assets WHERE id = ?', [id]);
        if (!asset) return notFound(res, 'Asset not found');

        const allowed = VALID_TRANSITIONS[asset.status] || [];
        if (!allowed.includes(new_status)) {
            return error(res, `Cannot transition from ${asset.status} to ${new_status}. Allowed: ${allowed.join(', ') || 'none'}`, 422);
        }

        await transaction(async (conn) => {
            await conn.execute('UPDATE assets SET status = ? WHERE id = ?', [new_status, id]);
            await conn.execute(
                `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, location_id, performed_by, reason, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, asset.status, new_status, `STATUS_CHANGED`, location_id || asset.location_id, req.user.id, reason, remarks || null]
            );
        });

        await auditLog(req.user.id, 'ASSET_STATUS_CHANGED', 'assets', id,
            { status: asset.status }, { status: new_status, reason }, getClientIP(req));

        const updated = await queryOne(`${ASSET_SELECT} WHERE a.id = ?`, [id]);
        return success(res, { asset: updated }, `Asset status changed to ${new_status}`);
    } catch (err) {
        console.error(err);
        return error(res, err.message || 'Failed to change status');
    }
};

export const retireAsset = async (req, res) => {
    try {
        req.body.new_status = 'RETIRED';
        if (!req.body.reason) req.body.reason = 'Asset retired';
        return changeAssetStatus(req, res);
    } catch (err) {
        return error(res, 'Failed to retire asset');
    }
};

export const getAssetLifecycle = async (req, res) => {
    try {
        const lifecycle = await query(
            `SELECT al.*, u.name as performed_by_name, l.name as location_name
       FROM asset_lifecycle al
       LEFT JOIN users u ON al.performed_by = u.id
       LEFT JOIN locations l ON al.location_id = l.id
       WHERE al.asset_id = ? ORDER BY al.created_at ASC`,
            [req.params.id]
        );
        return success(res, { lifecycle });
    } catch (err) {
        return error(res, 'Failed to retrieve lifecycle');
    }
};

function calculateHealthScore(asset) {
    let score = 0;
    const factors = {};

    // Condition (40%)
    const conditionMap = { EXCELLENT: 100, GOOD: 80, FAIR: 55, POOR: 25, CRITICAL: 5 };
    const condScore = conditionMap[asset.condition] || 50;
    factors.condition = { score: condScore, weight: 40, contribution: condScore * 0.4 };

    // Age (20%) — assume 15-year max life
    let ageScore = 100;
    if (asset.purchase_date) {
        const ageYears = (Date.now() - new Date(asset.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        ageScore = Math.max(0, Math.round(100 - (ageYears / 15) * 100));
    }
    factors.age = { score: ageScore, weight: 20, contribution: ageScore * 0.2 };

    // Maintenance (20%) — based on last maintenance date
    let maintScore = 50;
    if (asset.last_maintenance_date) {
        const daysSince = (Date.now() - new Date(asset.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24);
        maintScore = daysSince < 90 ? 100 : daysSince < 180 ? 75 : daysSince < 365 ? 50 : 25;
    } else {
        maintScore = 40;
    }
    factors.maintenance = { score: maintScore, weight: 20, contribution: maintScore * 0.2 };

    // Inspection (10%)
    let inspScore = 50;
    if (asset.last_inspection_date) {
        const daysSince = (Date.now() - new Date(asset.last_inspection_date).getTime()) / (1000 * 60 * 60 * 24);
        inspScore = daysSince < 90 ? 100 : daysSince < 180 ? 70 : daysSince < 365 ? 40 : 10;
    }
    factors.inspection = { score: inspScore, weight: 10, contribution: inspScore * 0.1 };

    // Warranty (10%)
    let warrantScore = 0;
    if (asset.warranty_expiry) {
        const daysLeft = (new Date(asset.warranty_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        warrantScore = daysLeft > 365 ? 100 : daysLeft > 90 ? 80 : daysLeft > 0 ? 50 : 0;
    }
    factors.warranty = { score: warrantScore, weight: 10, contribution: warrantScore * 0.1 };

    score = Math.round(
        factors.condition.contribution +
        factors.age.contribution +
        factors.maintenance.contribution +
        factors.inspection.contribution +
        factors.warranty.contribution
    );

    const category = score >= 80 ? 'HEALTHY' : score >= 60 ? 'MONITOR' : score >= 40 ? 'ATTENTION' : 'CRITICAL';
    return { score, category, factors };
}

export const deleteAsset = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin only' });
        const asset = await queryOne('SELECT id, asset_code FROM assets WHERE id = ?', [req.params.id]);
        if (!asset) return notFound(res, 'Asset not found');
        await query('DELETE FROM assets WHERE id = ?', [req.params.id]);
        await auditLog(req.user.id, 'ASSET_DELETED', 'assets', req.params.id, asset, null, getClientIP(req));
        return success(res, {}, 'Asset deleted');
    } catch (err) {
        return error(res, 'Failed to delete asset');
    }
};
