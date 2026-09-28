import { query } from '../config/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// One-time setup endpoint — run schema + seed on the cloud DB
// Protected by a SETUP_SECRET env var to prevent abuse
export const setupDatabase = async (req, res) => {
    try {
        const secret = req.headers['x-setup-secret'] || req.query.secret;
        if (!secret || secret !== process.env.SETUP_SECRET) {
            return res.status(403).json({ success: false, message: 'Forbidden: invalid setup secret' });
        }

        const results = [];

        // Run schema
        const schemaPath = join(__dirname, '../../../database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        const schemaStatements = schema
            .replace(/USE transitasset;/g, '')
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of schemaStatements) {
            try {
                await query(stmt);
            } catch (e) {
                // Ignore "table already exists" errors
                if (!e.message.includes('already exists')) {
                    results.push({ stmt: stmt.substring(0, 60), error: e.message });
                }
            }
        }

        // Run seed
        const seedPath = join(__dirname, '../../../database/seed.sql');
        const seed = readFileSync(seedPath, 'utf8');
        const seedStatements = seed
            .replace(/USE transitasset;/g, '')
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of seedStatements) {
            try {
                await query(stmt);
            } catch (e) {
                // Ignore duplicate entry errors (already seeded)
                if (!e.message.includes('Duplicate entry') && !e.message.includes('already exists')) {
                    results.push({ stmt: stmt.substring(0, 60), error: e.message });
                }
            }
        }

        return res.json({
            success: true,
            message: 'Database setup complete! Schema and seed data applied.',
            errors: results,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
