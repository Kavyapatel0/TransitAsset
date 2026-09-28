import { query } from '../config/database.js';

export const auditLog = async (userId, action, entityType, entityId, oldValue, newValue, ipAddress) => {
    try {
        await query(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId || null, action, entityType || null, entityId || null,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
            ipAddress || null]
        );
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

export const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;
};
