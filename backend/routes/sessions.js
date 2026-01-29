const express = require('express');
const router = express.Router();
const PracticeSession = require('../models/PracticeSession');

router.get('/', async (req, res) => {
    try {
        const sessions = await PracticeSession.getAll();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const session = await PracticeSession.getById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const session = await PracticeSession.create(req.body);
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await PracticeSession.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await PracticeSession.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:sessionId/questions/:questionId', async (req, res) => {
    try {
        const added = await PracticeSession.addQuestion(req.params.sessionId, req.params.questionId);
        if (!added) {
            return res.status(400).json({ error: 'Failed to add question to session' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:sessionId/questions/:questionId', async (req, res) => {
    try {
        const removed = await PracticeSession.removeQuestion(req.params.sessionId, req.params.questionId);
        if (!removed) {
            return res.status(404).json({ error: 'Question not found in session' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:sessionId/questions', async (req, res) => {
    try {
        const questions = await PracticeSession.getQuestions(req.params.sessionId);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;