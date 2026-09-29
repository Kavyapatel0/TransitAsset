import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, query } from '../config/database.js';
import { success, error, unauthorized } from '../utils/response.js';
import { auditLog, getClientIP } from '../utils/audit.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return error(res, 'Email and password are required', 400);

        const user = await queryOne(
            `SELECT u.id, u.name, u.email, u.password_hash, u.status, u.department_id, u.location_id,
              r.id as role_id, r.name as role
       FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?`,
            [email]
        );

        if (!user) return unauthorized(res, 'Invalid credentials');
        if (user.status !== 'ACTIVE') return unauthorized(res, 'Account is inactive or suspended');

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return unauthorized(res, 'Invalid credentials');

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Update last login
        await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
        await auditLog(user.id, 'USER_LOGIN', 'auth', null, null, { email: user.email }, getClientIP(req));

        const { password_hash, ...safeUser } = user;
        return success(res, { user: safeUser, token }, 'Login successful');
    } catch (err) {
        return error(res, 'Login failed');
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await queryOne(
            `SELECT u.id, u.name, u.email, u.status, u.department_id, u.location_id, u.last_login_at,
              r.name as role, d.name as department_name, l.name as location_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ?`,
            [req.user.id]
        );
        return success(res, { user }, 'User retrieved');
    } catch (err) {
        return error(res, 'Failed to retrieve user');
    }
};

export const logout = async (req, res) => {
    await auditLog(req.user.id, 'USER_LOGOUT', 'auth', null, null, null, getClientIP(req));
    return success(res, {}, 'Logged out successfully');
};
