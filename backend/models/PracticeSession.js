const db = require('../database');

class PracticeSession {
    static async getAll() {
        return await db.all(`
            SELECT ps.*, c.name as company_name, r.title as role_title
            FROM practice_sessions ps
            LEFT JOIN companies c ON ps.company_id = c.id
            LEFT JOIN roles r ON ps.role_id = r.id
            ORDER BY ps.created_at DESC
        `);
    }

    static async getById(id) {
        return await db.get(`
            SELECT ps.*, c.name as company_name, r.title as role_title
            FROM practice_sessions ps
            LEFT JOIN companies c ON ps.company_id = c.id
            LEFT JOIN roles r ON ps.role_id = r.id
            WHERE ps.id = ?
        `, [id]);
    }

    static async create(data) {
        const { name, company_id, role_id } = data;
        if (!name) throw new Error('Session name is required');

        const result = await db.run(
            'INSERT INTO practice_sessions (name, company_id, role_id) VALUES (?, ?, ?)',
            [name, company_id || null, role_id || null]
        );
        return { id: result.id, ...data };
    }

    static async update(id, data) {
        const { name, company_id, role_id } = data;
        if (!name) throw new Error('Session name is required');

        const result = await db.run(
            'UPDATE practice_sessions SET name = ?, company_id = ?, role_id = ? WHERE id = ?',
            [name, company_id || null, role_id || null, id]
        );
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM practice_sessions WHERE id = ?', [id]);
        return result.changes > 0;
    }

    static async addQuestion(sessionId, questionId) {
        try {
            await db.run(
                'INSERT OR IGNORE INTO practice_session_questions (session_id, question_id) VALUES (?, ?)',
                [sessionId, questionId]
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    static async removeQuestion(sessionId, questionId) {
        const result = await db.run(
            'DELETE FROM practice_session_questions WHERE session_id = ? AND question_id = ?',
            [sessionId, questionId]
        );
        return result.changes > 0;
    }

    static async getQuestions(sessionId) {
        return await db.all(
            'SELECT question_id FROM practice_session_questions WHERE session_id = ?',
            [sessionId]
        );
    }
}

module.exports = PracticeSession;