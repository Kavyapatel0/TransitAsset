import { query, queryOne } from '../config/database.js';
import { success, error, notFound } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

export const getDepartments = async (req, res) => {
    try {
        const depts = await query(
            `SELECT d.*, u.name as manager_name,
        (SELECT COUNT(*) FROM assets a WHERE a.department_id = d.id AND a.status != 'RETIRED') as asset_count
       FROM departments d LEFT JOIN users u ON d.manager_id = u.id ORDER BY d.name ASC`
        );
        return success(res, { departments: depts });
    } catch (err) {
        return error(res, 'Failed to retrieve departments');
    }
};

export const getDepartment = async (req, res) => {
    try {
        const dept = await queryOne(
            `SELECT d.*, u.name as manager_name FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id WHERE d.id = ?`,
            [req.params.id]
        );
        if (!dept) return notFound(res, 'Department not found');
        const members = await query(
            `SELECT u.id, u.name, u.email, r.name as role FROM users u
       JOIN roles r ON u.role_id = r.id WHERE u.department_id = ?`,
            [req.params.id]
        );
        return success(res, { department: dept, members });
    } catch (err) {
        return error(res, 'Failed to retrieve department');
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { name, description, manager_id } = req.body;
        if (!name) return error(res, 'Department name is required', 400);
        const result = await query(
            'INSERT INTO departments (name, description, manager_id) VALUES (?,?,?)',
            [name, description || null, manager_id || null]
        );
        await auditLog(req.user.id, 'DEPARTMENT_CREATED', 'departments', result.insertId, null, { name }, getClientIP(req));
        const dept = await queryOne('SELECT * FROM departments WHERE id = ?', [result.insertId]);
        return success(res, { department: dept }, 'Department created', 201);
    } catch (err) {
        return error(res, 'Failed to create department');
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const dept = await queryOne('SELECT * FROM departments WHERE id = ?', [req.params.id]);
        if (!dept) return notFound(res, 'Department not found');
        const { name, description, manager_id, status } = req.body;
        await query(
            'UPDATE departments SET name=?, description=?, manager_id=?, status=? WHERE id=?',
            [name || dept.name, description ?? dept.description, manager_id ?? dept.manager_id, status || dept.status, dept.id]
        );
        await auditLog(req.user.id, 'DEPARTMENT_UPDATED', 'departments', dept.id, dept, req.body, getClientIP(req));
        const updated = await queryOne('SELECT * FROM departments WHERE id = ?', [dept.id]);
        return success(res, { department: updated }, 'Department updated');
    } catch (err) {
        return error(res, 'Failed to update department');
    }
};
