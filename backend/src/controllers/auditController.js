import { query } from '../config/database.js';
import { success, error } from '../utils/response.js';

export const getAuditLogs = async (req, res) => {
    try {
        const { entity_type, action, user_id, page = 1, limit = 30 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;
        let where = ['1=1'], params = [];
        if (entity_type) { where.push('al.entity_type = ?'); params.push(entity_type); }
        if (action) { where.push('al.action LIKE ?'); params.push(`%${action}%`); }
        if (user_id) { where.push('al.user_id = ?'); params.push(user_id); }
        const whereStr = where.join(' AND ');
        const countRes = await query(`SELECT COUNT(*) as total FROM audit_logs al WHERE ${whereStr}`, params);
        const total = countRes[0].total;
        const logs = await query(
            `SELECT al.*, u.name as user_name, u.email as user_email FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${whereStr} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        return success(res, { logs, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (err) {
        return error(res, 'Failed to retrieve audit logs');
    }
};
