const db = require('../database');

class Role {
    static async getAll() {
        return await db.all('SELECT * FROM roles ORDER BY title');
    }

    static async getById(id) {
        return await db.get('SELECT * FROM roles WHERE id = ?', [id]);
    }

    static async create(title) {
        if (!title) throw new Error('Role title is required');
        const result = await db.run('INSERT INTO roles (title) VALUES (?)', [title]);
        return { id: result.id, title };
    }

    static async update(id, title) {
        if (!title) throw new Error('Role title is required');
        const result = await db.run('UPDATE roles SET title = ? WHERE id = ?', [title, id]);
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM roles WHERE id = ?', [id]);
        return result.changes > 0;
    }
}

module.exports = Role;