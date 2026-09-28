import { query, queryOne } from '../config/database.js';
import { success, error, notFound } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

export const getLocations = async (req, res) => {
    try {
        const { status, type } = req.query;
        let where = ['1=1'];
        let params = [];
        if (status) { where.push('l.status = ?'); params.push(status); }
        if (type) { where.push('l.type = ?'); params.push(type); }
        const locations = await query(
            `SELECT l.*, u.name as manager_name,
        (SELECT COUNT(*) FROM assets a WHERE a.location_id = l.id AND a.status != 'RETIRED') as asset_count
       FROM locations l LEFT JOIN users u ON l.manager_id = u.id
       WHERE ${where.join(' AND ')} ORDER BY l.name ASC`,
            params
        );
        return success(res, { locations });
    } catch (err) {
        return error(res, 'Failed to retrieve locations');
    }
};

export const getLocation = async (req, res) => {
    try {
        const location = await queryOne(
            `SELECT l.*, u.name as manager_name FROM locations l
       LEFT JOIN users u ON l.manager_id = u.id WHERE l.id = ?`,
            [req.params.id]
        );
        if (!location) return notFound(res, 'Location not found');
        const assets = await query(
            `SELECT a.id, a.asset_code, a.name, a.asset_type, a.status, a.condition FROM assets a
       WHERE a.location_id = ? AND a.status != 'RETIRED' ORDER BY a.asset_code ASC`,
            [req.params.id]
        );
        return success(res, { location, assets });
    } catch (err) {
        return error(res, 'Failed to retrieve location');
    }
};

export const createLocation = async (req, res) => {
    try {
        const { name, type, address, city, state, postal_code, contact_number, manager_id } = req.body;
        if (!name) return error(res, 'Location name is required', 400);
        const result = await query(
            'INSERT INTO locations (name, type, address, city, state, postal_code, contact_number, manager_id) VALUES (?,?,?,?,?,?,?,?)',
            [name, type || 'DEPOT', address || null, city || null, state || null, postal_code || null, contact_number || null, manager_id || null]
        );
        await auditLog(req.user.id, 'LOCATION_CREATED', 'locations', result.insertId, null, { name }, getClientIP(req));
        const loc = await queryOne('SELECT * FROM locations WHERE id = ?', [result.insertId]);
        return success(res, { location: loc }, 'Location created', 201);
    } catch (err) {
        return error(res, 'Failed to create location');
    }
};

export const updateLocation = async (req, res) => {
    try {
        const loc = await queryOne('SELECT * FROM locations WHERE id = ?', [req.params.id]);
        if (!loc) return notFound(res, 'Location not found');
        const { name, type, address, city, state, postal_code, contact_number, manager_id, status } = req.body;
        await query(
            'UPDATE locations SET name=?, type=?, address=?, city=?, state=?, postal_code=?, contact_number=?, manager_id=?, status=? WHERE id=?',
            [name || loc.name, type || loc.type, address ?? loc.address, city ?? loc.city, state ?? loc.state,
            postal_code ?? loc.postal_code, contact_number ?? loc.contact_number, manager_id ?? loc.manager_id,
            status || loc.status, loc.id]
        );
        await auditLog(req.user.id, 'LOCATION_UPDATED', 'locations', loc.id, loc, req.body, getClientIP(req));
        const updated = await queryOne('SELECT * FROM locations WHERE id = ?', [loc.id]);
        return success(res, { location: updated }, 'Location updated');
    } catch (err) {
        return error(res, 'Failed to update location');
    }
};
