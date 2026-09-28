import { query, queryOne, transaction } from '../config/database.js';
import { success, error, notFound, validationError } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

const VALID_TRANSITIONS = {
    OPEN: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
};

export const getMaintenanceRequests = async (req, res) => {
    try {
        const { status, priority, asset_id, technician_id, page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;

        let where = ['1=1'];
        let params = [];

        if (status) { where.push('mr.status = ?'); params.push(status); }
        if (priority) { where.push('mr.priority = ?'); params.push(priority); }
        if (asset_id) { where.push('mr.asset_id = ?'); params.push(asset_id); }
        if (req.user.role === 'TECHNICIAN') {
            where.push('mr.assigned_technician = ?');
            params.push(req.user.id);
        } else if (technician_id) {
            where.push('mr.assigned_technician = ?');
            params.push(technician_id);
        }

        const whereStr = where.join(' AND ');
        const [countRes] = await Promise.all([query(`SELECT COUNT(*) as total FROM maintenance_requests mr WHERE ${whereStr}`, params)]);
        const total = countRes[0].total;

        const records = await query(
            `SELECT mr.*, a.asset_code, a.name as asset_name, a.location_id,
              u1.name as reported_by_name, u2.name as technician_name, l.name as location_name
       FROM maintenance_requests mr
       JOIN assets a ON mr.asset_id = a.id
       LEFT JOIN locations l ON a.location_id = l.id
       LEFT JOIN users u1 ON mr.reported_by = u1.id
       LEFT JOIN users u2 ON mr.assigned_technician = u2.id
       WHERE ${whereStr} ORDER BY mr.reported_at DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        return success(res, { maintenance: records, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to retrieve maintenance requests');
    }
};

export const getMaintenance = async (req, res) => {
    try {
        const record = await queryOne(
            `SELECT mr.*, a.asset_code, a.name as asset_name, a.status as asset_status, a.condition as asset_condition,
              l.name as location_name, u1.name as reported_by_name, u2.name as technician_name
       FROM maintenance_requests mr
       JOIN assets a ON mr.asset_id = a.id
       LEFT JOIN locations l ON a.location_id = l.id
       LEFT JOIN users u1 ON mr.reported_by = u1.id
       LEFT JOIN users u2 ON mr.assigned_technician = u2.id
       WHERE mr.id = ?`,
            [req.params.id]
        );
        if (!record) return notFound(res, 'Maintenance request not found');
        return success(res, { maintenance: record });
    } catch (err) {
        return error(res, 'Failed to retrieve maintenance request');
    }
};

export const createMaintenance = async (req, res) => {
    try {
        const { asset_id, title, description, priority, scheduled_at, remarks } = req.body;
        if (!asset_id || !title) return validationError(res, [{ message: 'asset_id and title required' }]);

        const asset = await queryOne('SELECT id, status FROM assets WHERE id = ?', [asset_id]);
        if (!asset) return notFound(res, 'Asset not found');
        if (asset.status === 'RETIRED') return error(res, 'Cannot create maintenance for retired asset', 422);

        const result = await query(
            `INSERT INTO maintenance_requests (asset_id, reported_by, title, description, priority, status, scheduled_at, remarks)
       VALUES (?,?,?,?,?,'OPEN',?,?)`,
            [asset_id, req.user.id, title, description || null, priority || 'MEDIUM', scheduled_at || null, remarks || null]
        );

        await auditLog(req.user.id, 'MAINTENANCE_CREATED', 'maintenance_requests', result.insertId,
            null, { asset_id, title, priority }, getClientIP(req));

        const record = await queryOne('SELECT * FROM maintenance_requests WHERE id = ?', [result.insertId]);
        return success(res, { maintenance: record }, 'Maintenance request created', 201);
    } catch (err) {
        return error(res, 'Failed to create maintenance request');
    }
};

export const updateMaintenance = async (req, res) => {
    try {
        const record = await queryOne('SELECT * FROM maintenance_requests WHERE id = ?', [req.params.id]);
        if (!record) return notFound(res, 'Maintenance request not found');

        const { status, assigned_technician, diagnosis, resolution, maintenance_cost,
            parts_used, remarks, scheduled_at } = req.body;

        // Role check
        if (req.user.role === 'TECHNICIAN' && req.user.id !== record.assigned_technician) {
            return res.status(403).json({ success: false, message: 'Not assigned to this request' });
        }

        if (status && status !== record.status) {
            const allowed = VALID_TRANSITIONS[record.status] || [];
            if (!allowed.includes(status)) {
                return error(res, `Cannot transition from ${record.status} to ${status}`, 422);
            }
        }

        const newStatus = status || record.status;
        const now = new Date();
        let startedAt = record.started_at;
        let completedAt = record.completed_at;
        if (newStatus === 'IN_PROGRESS' && !startedAt) startedAt = now;
        if (newStatus === 'COMPLETED' && !completedAt) completedAt = now;

        await transaction(async (conn) => {
            await conn.execute(
                `UPDATE maintenance_requests SET status=?, assigned_technician=?, diagnosis=?, resolution=?,
          maintenance_cost=?, parts_used=?, remarks=?, scheduled_at=?, started_at=?, completed_at=?
         WHERE id=?`,
                [newStatus, assigned_technician ?? record.assigned_technician, diagnosis ?? record.diagnosis,
                    resolution ?? record.resolution, maintenance_cost ?? record.maintenance_cost,
                    parts_used ?? record.parts_used, remarks ?? record.remarks, scheduled_at ?? record.scheduled_at,
                    startedAt, completedAt, record.id]
            );

            // Asset status side effects
            if (newStatus === 'IN_PROGRESS' && record.status !== 'IN_PROGRESS') {
                const asset = await queryOne('SELECT id, status FROM assets WHERE id = ?', [record.asset_id]);
                if (asset && asset.status === 'OPERATIONAL') {
                    await conn.execute('UPDATE assets SET status = ? WHERE id = ?', ['UNDER_MAINTENANCE', record.asset_id]);
                    await conn.execute(
                        `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, performed_by, reason)
             VALUES (?, ?, 'UNDER_MAINTENANCE', 'MAINTENANCE_STARTED', ?, ?)`,
                        [record.asset_id, asset.status, req.user.id, `Maintenance started: ${record.title}`]
                    );
                }
            }

            if (newStatus === 'COMPLETED' && record.status !== 'COMPLETED') {
                const asset = await queryOne('SELECT id, status, location_id FROM assets WHERE id = ?', [record.asset_id]);
                if (asset) {
                    await conn.execute(
                        'UPDATE assets SET status = ?, last_maintenance_date = CURDATE() WHERE id = ?',
                        ['OPERATIONAL', record.asset_id]
                    );
                    await conn.execute(
                        `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, performed_by, reason, remarks)
             VALUES (?, 'UNDER_MAINTENANCE', 'OPERATIONAL', 'MAINTENANCE_COMPLETED', ?, ?, ?)`,
                        [record.asset_id, req.user.id, `Maintenance completed: ${record.title}`, resolution || null]
                    );
                }
            }
        });

        await auditLog(req.user.id, newStatus === 'COMPLETED' ? 'MAINTENANCE_COMPLETED' : 'MAINTENANCE_UPDATED',
            'maintenance_requests', record.id, { status: record.status }, { status: newStatus }, getClientIP(req));

        const updated = await queryOne('SELECT * FROM maintenance_requests WHERE id = ?', [record.id]);
        return success(res, { maintenance: updated }, 'Maintenance updated');
    } catch (err) {
        console.error(err);
        return error(res, err.message || 'Failed to update maintenance');
    }
};
