const db = require('../database');

class Answer {
    static async getByQuestionId(questionId) {
        return await db.all(
            'SELECT * FROM answers WHERE question_id = ? ORDER BY created_at DESC',
            [questionId]
        );
    }

    static async getById(id) {
        return await db.get('SELECT * FROM answers WHERE id = ?', [id]);
    }

    static async create(questionId, answerText) {
        if (!answerText) throw new Error('Answer text is required');
        
        const result = await db.run(
            'INSERT INTO answers (question_id, answer_text) VALUES (?, ?)',
            [questionId, answerText]
        );
        return { id: result.id, question_id: questionId, answer_text: answerText };
    }

    static async update(id, answerText) {
        if (!answerText) throw new Error('Answer text is required');
        
        const result = await db.run(
            'UPDATE answers SET answer_text = ? WHERE id = ?',
            [answerText, id]
        );
        return result.changes > 0;
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM answers WHERE id = ?', [id]);
        return result.changes > 0;
    }
}

module.exports = Answer;