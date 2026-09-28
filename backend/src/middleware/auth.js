import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/response.js';
import { queryOne } from '../config/database.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorized(res, 'No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await queryOne(
            'SELECT u.id, u.name, u.email, u.status, u.department_id, u.location_id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [decoded.id]
        );
        if (!user || user.status !== 'ACTIVE') {
            return unauthorized(res, 'Invalid or inactive account');
        }
        req.user = user;
        next();
    } catch (err) {
        return unauthorized(res, 'Invalid token');
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return unauthorized(res);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
    };
};
