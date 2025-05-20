const dbConn = require('../lib/db');
const bcrypt = require('bcryptjs');

const UserModel = {
    // Crear nuevo usuario
    async createUser({ username, email, password, role = 'user', status = 'active' }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await dbConn.query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, status]
        );
        return result.insertId;
    },

    // Buscar usuario por username o email
    async findByUsernameOrEmail(usernameOrEmail) {
        const [rows] = await dbConn.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [usernameOrEmail, usernameOrEmail]
        );
        return rows[0];
    },

    // Buscar usuario por ID
    async findById(id) {
        const [rows] = await dbConn.query('SELECT * FROM users WHERE id_user = ?', [id]);
        return rows[0];
    },

    // Actualizar usuario
    async updateUser(id, { username, email, password, role, status }) {
        const updates = [];
        const values = [];
        
        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }
        if (role) {
            updates.push('role = ?');
            values.push(role);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) return false;

        values.push(id);
        const [result] = await dbConn.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id_user = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    // Listar usuarios con filtros
    async listUsers({ role, status, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        let where = 'WHERE 1=1';
        const params = [];

        if (role) {
            where += ' AND role = ?';
            params.push(role);
        }
        if (status) {
            where += ' AND status = ?';
            params.push(status);
        }

        const [rows] = await dbConn.query(
            `SELECT id_user, username, email, role, status, created_at, updated_at 
             FROM users ${where} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [countRows] = await dbConn.query(
            `SELECT COUNT(*) as total FROM users ${where}`,
            params
        );

        return {
            users: rows,
            total: countRows[0].total,
            page,
            totalPages: Math.ceil(countRows[0].total / limit)
        };
    },

    // Cambiar estado de usuario
    async toggleStatus(id) {
        const [result] = await dbConn.query(
            'UPDATE users SET status = CASE WHEN status = "active" THEN "inactive" ELSE "active" END WHERE id_user = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = UserModel; 