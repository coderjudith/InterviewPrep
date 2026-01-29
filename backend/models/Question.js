const db = require('../database');

class Question {
    static async getAll(filters = {}) {
        let sql = `
            SELECT q.*, c.name as category_name, 
                   co.name as company_name, r.title as role_title
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN companies co ON q.company_id = co.id
            LEFT JOIN roles r ON q.role_id = r.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.category_id) {
            sql += ' AND q.category_id = ?';
            params.push(filters.category_id);
        }
        if (filters.company_id) {
            sql += ' AND q.company_id = ?';
            params.push(filters.company_id);
        }
        if (filters.role_id) {
            sql += ' AND q.role_id = ?';
            params.push(filters.role_id);
        }
        if (filters.search) {
            sql += ' AND q.question_text LIKE ?';
            params.push(`%${filters.search}%`);
        }

        sql += ' ORDER BY q.created_at DESC';
        return await db.all(sql, params);
    }

    static async getById(id) {
        return await db.get(`
            SELECT q.*, c.name as category_name, 
                   co.name as company_name, r.title as role_title
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN companies co ON q.company_id = co.id
            LEFT JOIN roles r ON q.role_id = r.id
            WHERE q.id = ?
        `, [id]);
    }

    static async create(data) {
        const { question_text, category_id, company_id, role_id } = data;
        if (!question_text) throw new Error('Question text is required');

        const result = await db.run(
            'INSERT INTO questions (question_text, category_id, company_id, role_id) VALUES (?, ?, ?, ?)',
            [question_text, category_id || null, company_id || null, role_id || null]
        );
        return { id: result.id, ...data };
    }

    static async update(id, data) {
        const { question_text, category_id, company_id, role_id } = data;
        if (!question_text) throw new Error('Question text is required');

        const result = await db.run(
            'UPDATE questions SET question_text = ?, category_id = ?, company_id = ?, role_id = ? WHERE id = ?',
            [question_text, category_id || null, company_id || null, role_id || null, id]
        );
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM questions WHERE id = ?', [id]);
        return result.changes > 0;
    }

    static async getQuestionsForSession(sessionId) {
        return await db.all(`
            SELECT q.*, c.name as category_name, 
                   co.name as company_name, r.title as role_title
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN companies co ON q.company_id = co.id
            LEFT JOIN roles r ON q.role_id = r.id
            INNER JOIN practice_session_questions psq ON q.id = psq.question_id
            WHERE psq.session_id = ?
            ORDER BY psq.added_at DESC
        `, [sessionId]);
    }
}

module.exports = Question;