import { query, queryOne } from '../config/database.js';
import { success, error, notFound } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
    try {
        const users = await query(
            `SELECT u.id, u.name, u.email, u.status, u.last_login_at, u.created_at,
              r.name as role, d.name as department_name, l.name as location_name
       FROM users u JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN locations l ON u.location_id = l.id
       ORDER BY u.name ASC`
        );
        return success(res, { users });
    } catch (err) {
        return error(res, 'Failed to retrieve users');
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await queryOne(
            `SELECT u.id, u.name, u.email, u.status, u.last_login_at, u.created_at,
              r.id as role_id, r.name as role, d.name as department_name, l.name as location_name,
              u.department_id, u.location_id
       FROM users u JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ?`,
            [req.params.id]
        );
        if (!user) return notFound(res, 'User not found');
        return success(res, { user });
    } catch (err) {
        return error(res, 'Failed to retrieve user');
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role_id, department_id, location_id } = req.body;
        if (!name || !email || !password || !role_id) return error(res, 'name, email, password, role_id required', 400);
        const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return error(res, 'Email already registered', 409);
        const hash = await bcrypt.hash(password, 12);
        const result = await query(
            'INSERT INTO users (name, email, password_hash, role_id, department_id, location_id) VALUES (?,?,?,?,?,?)',
            [name, email, hash, role_id, department_id || null, location_id || null]
        );
        await auditLog(req.user.id, 'USER_CREATED', 'users', result.insertId, null, { name, email, role_id }, getClientIP(req));
        const user = await queryOne(`SELECT u.id, u.name, u.email, u.status, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`, [result.insertId]);
        return success(res, { user }, 'User created', 201);
    } catch (err) {
        return error(res, 'Failed to create user');
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) return notFound(res, 'User not found');
        const { name, role_id, department_id, location_id, status } = req.body;
        await query(
            'UPDATE users SET name=?, role_id=?, department_id=?, location_id=?, status=? WHERE id=?',
            [name || user.name, role_id || user.role_id, department_id ?? user.department_id,
            location_id ?? user.location_id, status || user.status, user.id]
        );
        await auditLog(req.user.id, 'USER_UPDATED', 'users', user.id, user, req.body, getClientIP(req));
        return success(res, {}, 'User updated');
    } catch (err) {
        return error(res, 'Failed to update user');
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await query('SELECT * FROM roles ORDER BY id');
        return success(res, { roles });
    } catch (err) {
        return error(res, 'Failed to retrieve roles');
    }
};
