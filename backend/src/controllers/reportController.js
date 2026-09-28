import { query } from '../config/database.js';
import { success, error } from '../utils/response.js';

export const getReports = async (req, res) => {
    try {
        const { type = 'inventory', category, status, location_id, department_id, from_date, to_date } = req.query;
        let data = [], columns = [];

        if (type === 'inventory') {
            let where = ['1=1'], params = [];
            if (category) { where.push('a.category = ?'); params.push(category); }
            if (status) { where.push('a.status = ?'); params.push(status); }
            if (location_id) { where.push('a.location_id = ?'); params.push(location_id); }
            if (department_id) { where.push('a.department_id = ?'); params.push(department_id); }
            data = await query(
                `SELECT a.asset_code, a.name, a.asset_type, a.category, a.serial_number,
                a.manufacturer, a.model, a.purchase_date, a.purchase_cost,
                a.warranty_expiry, a.ownership_type, a.status, a.condition,
                l.name as location, d.name as department
         FROM assets a
         LEFT JOIN locations l ON a.location_id = l.id
         LEFT JOIN departments d ON a.department_id = d.id
         WHERE ${where.join(' AND ')} ORDER BY a.asset_code`,
                params
            );
        } else if (type === 'maintenance') {
            let where = ['1=1'], params = [];
            if (status) { where.push('mr.status = ?'); params.push(status); }
            if (from_date) { where.push('mr.reported_at >= ?'); params.push(from_date); }
            if (to_date) { where.push('mr.reported_at <= ?'); params.push(to_date); }
            data = await query(
                `SELECT a.asset_code, a.name as asset_name, mr.title, mr.priority, mr.status,
                mr.reported_at, mr.completed_at, mr.maintenance_cost, mr.diagnosis,
                u1.name as reported_by, u2.name as technician
         FROM maintenance_requests mr JOIN assets a ON mr.asset_id = a.id
         LEFT JOIN users u1 ON mr.reported_by = u1.id
         LEFT JOIN users u2 ON mr.assigned_technician = u2.id
         WHERE ${where.join(' AND ')} ORDER BY mr.reported_at DESC`,
                params
            );
        } else if (type === 'inspection') {
            let where = ['1=1'], params = [];
            if (from_date) { where.push('i.inspection_date >= ?'); params.push(from_date); }
            if (to_date) { where.push('i.inspection_date <= ?'); params.push(to_date); }
            data = await query(
                `SELECT a.asset_code, a.name as asset_name, a.category,
                i.inspection_date, i.result, i.condition, i.findings, i.next_inspection_date,
                u.name as inspector
         FROM inspections i JOIN assets a ON i.asset_id = a.id
         LEFT JOIN users u ON i.inspector_id = u.id
         WHERE ${where.join(' AND ')} ORDER BY i.inspection_date DESC`,
                params
            );
        } else if (type === 'transfer') {
            let where = ['1=1'], params = [];
            if (status) { where.push('t.status = ?'); params.push(status); }
            data = await query(
                `SELECT a.asset_code, a.name as asset_name, fl.name as from_location, tl.name as to_location,
                t.status, t.reason, t.request_date, t.transfer_date,
                u1.name as requested_by, u2.name as approved_by
         FROM asset_transfers t JOIN assets a ON t.asset_id = a.id
         LEFT JOIN locations fl ON t.from_location_id = fl.id
         LEFT JOIN locations tl ON t.to_location_id = tl.id
         LEFT JOIN users u1 ON t.requested_by = u1.id
         LEFT JOIN users u2 ON t.approved_by = u2.id
         WHERE ${where.join(' AND ')} ORDER BY t.created_at DESC`,
                params
            );
        } else if (type === 'warranty') {
            data = await query(
                `SELECT a.asset_code, a.name, a.category, a.manufacturer, a.model,
                a.purchase_date, a.warranty_start, a.warranty_expiry, a.status,
                l.name as location,
                CASE WHEN a.warranty_expiry < CURDATE() THEN 'EXPIRED'
                     WHEN a.warranty_expiry < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'EXPIRING_SOON'
                     ELSE 'ACTIVE' END as warranty_status
         FROM assets a LEFT JOIN locations l ON a.location_id = l.id
         WHERE a.status != 'RETIRED' ORDER BY a.warranty_expiry ASC`
            );
        } else if (type === 'retired') {
            data = await query(
                `SELECT a.asset_code, a.name, a.category, a.manufacturer, a.model,
                a.purchase_date, a.purchase_cost, l.name as last_location, d.name as department
         FROM assets a
         LEFT JOIN locations l ON a.location_id = l.id
         LEFT JOIN departments d ON a.department_id = d.id
         WHERE a.status = 'RETIRED' ORDER BY a.updated_at DESC`
            );
        }

        return success(res, { report: { type, data, count: data.length } });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to generate report');
    }
};
