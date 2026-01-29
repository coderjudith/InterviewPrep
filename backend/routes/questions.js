const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.category_id) filters.category_id = req.query.category_id;
        if (req.query.company_id) filters.company_id = req.query.company_id;
        if (req.query.role_id) filters.role_id = req.query.role_id;
        if (req.query.search) filters.search = req.query.search;

        const questions = await Question.getAll(filters);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const question = await Question.getById(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Question.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Question.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/session/:sessionId', async (req, res) => {
    try {
        const questions = await Question.getQuestionsForSession(req.params.sessionId);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;