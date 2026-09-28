import { query, queryOne } from '../config/database.js';
import { success, error } from '../utils/response.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalRes, operationalRes, maintenanceRes, inspectionRes, retiredRes,
            maintDueRes, inspDueRes, warrantyRes, criticalRes, pendingTransferRes
        ] = await Promise.all([
            query("SELECT COUNT(*) as count FROM assets WHERE status != 'RETIRED'"),
            query("SELECT COUNT(*) as count FROM assets WHERE status = 'OPERATIONAL'"),
            query("SELECT COUNT(*) as count FROM assets WHERE status = 'UNDER_MAINTENANCE'"),
            query("SELECT COUNT(*) as count FROM assets WHERE status = 'UNDER_INSPECTION'"),
            query("SELECT COUNT(*) as count FROM assets WHERE status = 'RETIRED'"),
            query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN ('OPEN','ASSIGNED') AND priority IN ('HIGH','CRITICAL')"),
            query("SELECT COUNT(*) as count FROM assets WHERE next_inspection_date < CURDATE() AND status != 'RETIRED'"),
            query("SELECT COUNT(*) as count FROM assets WHERE warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status != 'RETIRED'"),
            query("SELECT COUNT(*) as count FROM assets WHERE `condition` IN ('POOR','CRITICAL') AND status != 'RETIRED'"),
            query("SELECT COUNT(*) as count FROM asset_transfers WHERE status IN ('REQUESTED','APPROVED','IN_TRANSIT')")
        ]);

        return success(res, {
            stats: {
                totalAssets: totalRes[0].count,
                operational: operationalRes[0].count,
                underMaintenance: maintenanceRes[0].count,
                underInspection: inspectionRes[0].count,
                retired: retiredRes[0].count,
                maintenanceDue: maintDueRes[0].count,
                inspectionOverdue: inspDueRes[0].count,
                warrantyExpiring: warrantyRes[0].count,
                criticalCondition: criticalRes[0].count,
                pendingTransfers: pendingTransferRes[0].count
            }
        });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to retrieve dashboard stats');
    }
};

export const getDashboardCharts = async (req, res) => {
    try {
        const [byCategory, byStatus, byCondition, byLocation, maintByMonth, maintByCost] = await Promise.all([
            // Assets by category
            query(`SELECT category, COUNT(*) as count FROM assets WHERE status != 'RETIRED' GROUP BY category ORDER BY count DESC`),
            // Assets by status
            query(`SELECT status, COUNT(*) as count FROM assets GROUP BY status ORDER BY count DESC`),
            // Assets by condition
            query(`SELECT \`condition\`, COUNT(*) as count FROM assets WHERE status != 'RETIRED' GROUP BY \`condition\` ORDER BY count DESC`),
            // Assets by location
            query(`SELECT l.name as location, l.type, COUNT(a.id) as count
             FROM locations l LEFT JOIN assets a ON a.location_id = l.id AND a.status != 'RETIRED'
             WHERE l.status = 'ACTIVE' GROUP BY l.id ORDER BY count DESC LIMIT 10`),
            // Maintenance requests by month (last 6 months)
            query(`SELECT DATE_FORMAT(reported_at, '%Y-%m') as month, COUNT(*) as count,
                    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
             FROM maintenance_requests
             WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month ORDER BY month ASC`),
            // Maintenance cost by category
            query(`SELECT a.category, SUM(mr.maintenance_cost) as total_cost, COUNT(mr.id) as count
             FROM maintenance_requests mr JOIN assets a ON mr.asset_id = a.id
             WHERE mr.status = 'COMPLETED' AND mr.maintenance_cost IS NOT NULL
             GROUP BY a.category ORDER BY total_cost DESC`)
        ]);

        return success(res, { charts: { byCategory, byStatus, byCondition, byLocation, maintByMonth, maintByCost } });
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to retrieve charts data');
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const activity = await query(
            `SELECT al.id, al.asset_id, al.event_type, al.new_status, al.previous_status, al.reason, al.created_at,
              a.asset_code, a.name as asset_name,
              u.name as performed_by_name
       FROM asset_lifecycle al
       JOIN assets a ON al.asset_id = a.id
       LEFT JOIN users u ON al.performed_by = u.id
       ORDER BY al.created_at DESC LIMIT 15`
        );
        return success(res, { activity });
    } catch (err) {
        return error(res, 'Failed to retrieve recent activity');
    }
};

export const getLocationOverview = async (req, res) => {
    try {
        const overview = await query(
            `SELECT l.id, l.name, l.type,
        COUNT(a.id) as total_assets,
        SUM(CASE WHEN a.status = 'OPERATIONAL' THEN 1 ELSE 0 END) as operational,
        SUM(CASE WHEN a.status = 'UNDER_MAINTENANCE' THEN 1 ELSE 0 END) as under_maintenance,
        SUM(CASE WHEN a.status = 'UNDER_INSPECTION' THEN 1 ELSE 0 END) as under_inspection,
        SUM(CASE WHEN a.\`condition\` IN ('POOR','CRITICAL') THEN 1 ELSE 0 END) as critical_condition
       FROM locations l
       LEFT JOIN assets a ON a.location_id = l.id AND a.status != 'RETIRED'
       WHERE l.status = 'ACTIVE' GROUP BY l.id ORDER BY total_assets DESC`
        );
        return success(res, { overview });
    } catch (err) {
        return error(res, 'Failed to retrieve location overview');
    }
};
