import { query, queryOne, transaction } from '../config/database.js';
import { success, error, notFound, validationError } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

const VALID_TRANSITIONS = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['IN_TRANSIT', 'REJECTED'],
    IN_TRANSIT: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: []
};

export const getTransfers = async (req, res) => {
    try {
        const { status, asset_id, page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;
        let where = ['1=1']; let params = [];
        if (status) { where.push('t.status = ?'); params.push(status); }
        if (asset_id) { where.push('t.asset_id = ?'); params.push(asset_id); }
        const whereStr = where.join(' AND ');
        const countRes = await query(`SELECT COUNT(*) as total FROM asset_transfers t WHERE ${whereStr}`, params);
        const total = countRes[0].total;
        const records = await query(
            `SELECT t.*, a.asset_code, a.name as asset_name, a.asset_type,
              fl.name as from_location_name, tl.name as to_location_name,
              u1.name as requested_by_name, u2.name as approved_by_name
       FROM asset_transfers t JOIN assets a ON t.asset_id = a.id
       LEFT JOIN locations fl ON t.from_location_id = fl.id
       LEFT JOIN locations tl ON t.to_location_id = tl.id
       LEFT JOIN users u1 ON t.requested_by = u1.id
       LEFT JOIN users u2 ON t.approved_by = u2.id
       WHERE ${whereStr} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        return success(res, { transfers: records, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (err) {
        return error(res, 'Failed to retrieve transfers');
    }
};

export const createTransfer = async (req, res) => {
    try {
        const { asset_id, to_location_id, reason, remarks } = req.body;
        if (!asset_id || !to_location_id || !reason) {
            return validationError(res, [{ message: 'asset_id, to_location_id, reason are required' }]);
        }
        const asset = await queryOne('SELECT id, status, location_id FROM assets WHERE id = ?', [asset_id]);
        if (!asset) return notFound(res, 'Asset not found');
        if (asset.status === 'RETIRED') return error(res, 'Cannot transfer retired asset', 422);
        if (asset.location_id && asset.location_id == to_location_id) {
            return error(res, 'Source and destination cannot be the same location', 422);
        }
        // Check for active transfer
        const activeTransfer = await queryOne(
            `SELECT id FROM asset_transfers WHERE asset_id = ? AND status IN ('REQUESTED','APPROVED','IN_TRANSIT')`,
            [asset_id]
        );
        if (activeTransfer) return error(res, 'Asset already has an active transfer in progress', 422);

        const result = await query(
            `INSERT INTO asset_transfers (asset_id, from_location_id, to_location_id, requested_by, reason, status, remarks)
       VALUES (?,?,?,?,'REQUESTED',?,?)`,
            [asset_id, asset.location_id || null, to_location_id, req.user.id, reason, remarks || null]
        );

        await auditLog(req.user.id, 'TRANSFER_CREATED', 'asset_transfers', result.insertId,
            null, { asset_id, from: asset.location_id, to: to_location_id, status: 'REQUESTED' }, getClientIP(req));

        const transfer = await queryOne('SELECT * FROM asset_transfers WHERE id = ?', [result.insertId]);
        return success(res, { transfer }, 'Transfer request created', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to create transfer');
    }
};

export const updateTransfer = async (req, res) => {
    try {
        const record = await queryOne('SELECT * FROM asset_transfers WHERE id = ?', [req.params.id]);
        if (!record) return notFound(res, 'Transfer not found');
        const { status, remarks } = req.body;
        if (!status) return validationError(res, [{ message: 'status is required' }]);

        const allowed = VALID_TRANSITIONS[record.status] || [];
        if (!allowed.includes(status)) {
            return error(res, `Cannot transition from ${record.status} to ${status}`, 422);
        }

        // Admin required to approve/reject
        if (['APPROVED', 'REJECTED'].includes(status) && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only admin can approve/reject transfers' });
        }

        await transaction(async (conn) => {
            const now = new Date();
            let approvedBy = record.approved_by;
            let transferDate = record.transfer_date;
            if (status === 'APPROVED') approvedBy = req.user.id;
            if (status === 'COMPLETED') transferDate = now;

            await conn.execute(
                'UPDATE asset_transfers SET status=?, approved_by=?, transfer_date=?, remarks=? WHERE id=?',
                [status, approvedBy, transferDate, remarks ?? record.remarks, record.id]
            );

            if (status === 'COMPLETED') {
                const asset = await queryOne('SELECT id, status FROM assets WHERE id = ?', [record.asset_id]);
                await conn.execute(
                    'UPDATE assets SET location_id = ?, status = ? WHERE id = ?',
                    [record.to_location_id, 'OPERATIONAL', record.asset_id]
                );
                await conn.execute(
                    `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, location_id, performed_by, reason, remarks)
           VALUES (?, ?, 'OPERATIONAL', 'TRANSFER_COMPLETED', ?, ?, ?, ?)`,
                    [record.asset_id, asset.status, record.to_location_id, req.user.id,
                        `Transfer completed`, `Moved from location ${record.from_location_id} to ${record.to_location_id}`]
                );
            }
        });

        await auditLog(req.user.id, `TRANSFER_${status}`, 'asset_transfers', record.id,
            { status: record.status }, { status, approvedBy: status === 'APPROVED' ? req.user.id : undefined }, getClientIP(req));

        const updated = await queryOne('SELECT * FROM asset_transfers WHERE id = ?', [record.id]);
        return success(res, { transfer: updated }, `Transfer ${status.toLowerCase()}`);
    } catch (err) {
        console.error(err);
        return error(res, err.message || 'Failed to update transfer');
    }
};
