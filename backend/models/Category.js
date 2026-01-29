const db = require('../database');

class Category {
    static async getAll() {
        return await db.all('SELECT * FROM categories ORDER BY name');
    }

    static async getById(id) {
        return await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    }

    static async create(name) {
        if (!name) throw new Error('Category name is required');
        const result = await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
        return { id: result.id, name };
    }

    static async update(id, name) {
        if (!name) throw new Error('Category name is required');
        const result = await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
        return result.changes > 0;
    }
}

module.exports = Category;