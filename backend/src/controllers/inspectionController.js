import { query, queryOne, transaction } from '../config/database.js';
import { success, error, notFound, validationError } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

export const getInspections = async (req, res) => {
    try {
        const { asset_id, result, page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;
        let where = ['1=1']; let params = [];
        if (asset_id) { where.push('i.asset_id = ?'); params.push(asset_id); }
        if (result) { where.push('i.result = ?'); params.push(result); }
        const whereStr = where.join(' AND ');
        const countRes = await query(`SELECT COUNT(*) as total FROM inspections i WHERE ${whereStr}`, params);
        const total = countRes[0].total;
        const records = await query(
            `SELECT i.*, a.asset_code, a.name as asset_name, u.name as inspector_name
       FROM inspections i JOIN assets a ON i.asset_id = a.id
       LEFT JOIN users u ON i.inspector_id = u.id
       WHERE ${whereStr} ORDER BY i.inspection_date DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        return success(res, { inspections: records, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (err) {
        return error(res, 'Failed to retrieve inspections');
    }
};

export const createInspection = async (req, res) => {
    try {
        const { asset_id, inspection_date, result, condition, findings, recommendations, next_inspection_date, remarks } = req.body;
        if (!asset_id || !inspection_date || !result) {
            return validationError(res, [{ message: 'asset_id, inspection_date, result required' }]);
        }
        const asset = await queryOne('SELECT id, status FROM assets WHERE id = ?', [asset_id]);
        if (!asset) return notFound(res, 'Asset not found');
        if (asset.status === 'RETIRED') return error(res, 'Cannot inspect retired asset', 422);

        await transaction(async (conn) => {
            const [iRes] = await conn.execute(
                `INSERT INTO inspections (asset_id, inspector_id, inspection_date, result, \`condition\`, findings, recommendations, next_inspection_date, remarks)
         VALUES (?,?,?,?,?,?,?,?,?)`,
                [asset_id, req.user.id, inspection_date, result, condition || 'GOOD', findings || null,
                    recommendations || null, next_inspection_date || null, remarks || null]
            );

            // Update asset condition and inspection dates
            let newStatus = asset.status;
            if (asset.status === 'UNDER_INSPECTION') newStatus = 'OPERATIONAL';

            await conn.execute(
                `UPDATE assets SET \`condition\`=?, last_inspection_date=?, next_inspection_date=?, status=? WHERE id=?`,
                [condition || asset.condition, inspection_date, next_inspection_date || null, newStatus, asset_id]
            );

            // Create lifecycle event
            await conn.execute(
                `INSERT INTO asset_lifecycle (asset_id, previous_status, new_status, event_type, performed_by, reason, remarks)
         VALUES (?, ?, ?, 'INSPECTION_COMPLETED', ?, ?, ?)`,
                [asset_id, asset.status, newStatus, req.user.id, `Inspection completed - Result: ${result}`, `Condition: ${condition}`]
            );
        });

        await auditLog(req.user.id, 'INSPECTION_CREATED', 'inspections', null, null, { asset_id, result, condition }, getClientIP(req));
        return success(res, {}, 'Inspection recorded', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to create inspection');
    }
};

export const updateInspection = async (req, res) => {
    try {
        const record = await queryOne('SELECT * FROM inspections WHERE id = ?', [req.params.id]);
        if (!record) return notFound(res, 'Inspection not found');
        const { findings, recommendations, next_inspection_date, remarks } = req.body;
        await query(
            'UPDATE inspections SET findings=?, recommendations=?, next_inspection_date=?, remarks=? WHERE id=?',
            [findings ?? record.findings, recommendations ?? record.recommendations,
            next_inspection_date ?? record.next_inspection_date, remarks ?? record.remarks, record.id]
        );
        const updated = await queryOne('SELECT * FROM inspections WHERE id = ?', [record.id]);
        return success(res, { inspection: updated }, 'Inspection updated');
    } catch (err) {
        return error(res, 'Failed to update inspection');
    }
};
