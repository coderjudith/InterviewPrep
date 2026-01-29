const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');

router.get('/question/:questionId', async (req, res) => {
    try {
        const answers = await Answer.getByQuestionId(req.params.questionId);
        res.json(answers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/question/:questionId', async (req, res) => {
    try {
        const { answer_text } = req.body;
        const answer = await Answer.create(req.params.questionId, answer_text);
        res.status(201).json(answer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { answer_text } = req.body;
        const updated = await Answer.update(req.params.id, answer_text);
        if (!updated) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Answer.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;