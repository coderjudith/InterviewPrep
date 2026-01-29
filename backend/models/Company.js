const db = require('../database');

class Company {
    static async getAll() {
        return await db.all('SELECT * FROM companies ORDER BY name');
    }

    static async getById(id) {
        return await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    }

    static async create(name) {
        if (!name) throw new Error('Company name is required');
        const result = await db.run('INSERT INTO companies (name) VALUES (?)', [name]);
        return { id: result.id, name };
    }

    static async update(id, name) {
        if (!name) throw new Error('Company name is required');
        const result = await db.run('UPDATE companies SET name = ? WHERE id = ?', [name, id]);
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM companies WHERE id = ?', [id]);
        return result.changes > 0;
    }
}

module.exports = Company;