import { query, queryOne } from '../config/database.js';
import { success, error, notFound } from '../utils/response.js';

export const getAlerts = async (req, res) => {
    try {
        const { severity, is_read, page = 1, limit = 30 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;
        let where = ['1=1'], params = [];
        if (severity) { where.push('al.severity = ?'); params.push(severity); }
        if (is_read !== undefined && is_read !== '') { where.push('al.is_read = ?'); params.push(parseInt(is_read)); }
        const whereStr = where.join(' AND ');
        const countRes = await query(`SELECT COUNT(*) as total FROM alerts al WHERE ${whereStr}`, params);
        const total = countRes[0].total;
        const alerts = await query(
            `SELECT al.*, a.asset_code, a.name as asset_name FROM alerts al
       LEFT JOIN assets a ON al.asset_id = a.id
       WHERE ${whereStr} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        return success(res, { alerts, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (err) {
        return error(res, 'Failed to retrieve alerts');
    }
};

export const markAlertRead = async (req, res) => {
    try {
        const alert = await queryOne('SELECT id FROM alerts WHERE id = ?', [req.params.id]);
        if (!alert) return notFound(res, 'Alert not found');
        await query('UPDATE alerts SET is_read = 1 WHERE id = ?', [req.params.id]);
        return success(res, {}, 'Alert marked as read');
    } catch (err) {
        return error(res, 'Failed to mark alert');
    }
};

export const markAllRead = async (req, res) => {
    try {
        await query('UPDATE alerts SET is_read = 1 WHERE is_read = 0');
        return success(res, {}, 'All alerts marked as read');
    } catch (err) {
        return error(res, 'Failed to mark alerts');
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const result = await query('SELECT COUNT(*) as count FROM alerts WHERE is_read = 0');
        return success(res, { count: result[0].count });
    } catch (err) {
        return error(res, 'Failed to get unread count');
    }
};
