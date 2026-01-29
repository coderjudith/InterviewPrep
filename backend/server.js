const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1']
}));
app.use(express.json());

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'interview.db'));

// Initialize database tables
db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create companies table
    db.run(`CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create roles table
    db.run(`CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        category_id INTEGER,
        company_id INTEGER,
        role_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    )`);
    
    // Create answers table
    db.run(`CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        answer_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`);
    
    // Create practice_sessions table
    db.run(`CREATE TABLE IF NOT EXISTS practice_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_id INTEGER,
        role_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    )`);
    
    // Create practice_session_questions table
    db.run(`CREATE TABLE IF NOT EXISTS practice_session_questions (
        session_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id, question_id),
        FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )`);
    
    // Insert default categories
    const defaultCategories = [
        'Work History & Background',
        'Reasons for Leaving / Career Transitions',
        'Motivation & Interest in the Role',
        'Strengths, Skills & Value',
        'Behavioral (General)',
        'Leadership & Management',
        'Work Style & Preferences',
        'Customer Service & Client Management',
        'Adaptability & Change',
        'Time Management & Organization',
        'Communication Skills',
        'Motivation, Values & Achievement',
        'Career Goals & Future Plans',
        'Compensation & Logistics',
        'Situational / Hypothetical',
        'Creative / Curveball',
        'Closing Questions'
    ];
    
    const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    defaultCategories.forEach(category => {
        stmt.run(category);
    });
    stmt.finalize();
    
    console.log('Database initialized with all tables and default categories');
});

// Helper functions for database queries
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// ========== CATEGORIES ENDPOINTS ==========
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await dbAll('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        
        const result = await dbRun(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        
        res.status(201).json({ 
            id: result.id, 
            name: name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        
        const result = await dbRun(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM categories WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== COMPANIES ENDPOINTS ==========
app.get('/api/companies', async (req, res) => {
    try {
        const companies = await dbAll('SELECT * FROM companies ORDER BY name');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/companies', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        
        const result = await dbRun(
            'INSERT INTO companies (name) VALUES (?)',
            [name]
        );
        
        res.status(201).json({ 
            id: result.id, 
            name: name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/companies/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        
        const result = await dbRun(
            'UPDATE companies SET name = ? WHERE id = ?',
            [name, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/companies/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM companies WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ROLES ENDPOINTS ==========
app.get('/api/roles', async (req, res) => {
    try {
        const roles = await dbAll('SELECT * FROM roles ORDER BY title');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Role title is required' });
        }
        
        const result = await dbRun(
            'INSERT INTO roles (title) VALUES (?)',
            [title]
        );
        
        res.status(201).json({ 
            id: result.id, 
            title: title
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Role title is required' });
        }
        
        const result = await dbRun(
            'UPDATE roles SET title = ? WHERE id = ?',
            [title, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM roles WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== QUESTIONS ENDPOINTS ==========
app.get('/api/questions', async (req, res) => {
    try {
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

        if (req.query.category_id) {
            sql += ' AND q.category_id = ?';
            params.push(req.query.category_id);
        }
        if (req.query.company_id) {
            sql += ' AND q.company_id = ?';
            params.push(req.query.company_id);
        }
        if (req.query.role_id) {
            sql += ' AND q.role_id = ?';
            params.push(req.query.role_id);
        }
        if (req.query.search) {
            sql += ' AND q.question_text LIKE ?';
            params.push(`%${req.query.search}%`);
        }

        sql += ' ORDER BY q.created_at DESC';
        const questions = await dbAll(sql, params);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/questions/:id', async (req, res) => {
    try {
        const question = await dbGet(`
            SELECT q.*, c.name as category_name, 
                   co.name as company_name, r.title as role_title
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN companies co ON q.company_id = co.id
            LEFT JOIN roles r ON q.role_id = r.id
            WHERE q.id = ?
        `, [req.params.id]);
        
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/questions', async (req, res) => {
    try {
        const { question_text, category_id, company_id, role_id } = req.body;
        if (!question_text) {
            return res.status(400).json({ error: 'Question text is required' });
        }
        
        const result = await dbRun(
            'INSERT INTO questions (question_text, category_id, company_id, role_id) VALUES (?, ?, ?, ?)',
            [question_text, category_id || null, company_id || null, role_id || null]
        );
        
        res.status(201).json({ 
            id: result.id, 
            question_text, 
            category_id: category_id || null,
            company_id: company_id || null,
            role_id: role_id || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/questions/:id', async (req, res) => {
    try {
        const { question_text, category_id, company_id, role_id } = req.body;
        if (!question_text) {
            return res.status(400).json({ error: 'Question text is required' });
        }
        
        const result = await dbRun(
            'UPDATE questions SET question_text = ?, category_id = ?, company_id = ?, role_id = ? WHERE id = ?',
            [question_text, category_id || null, company_id || null, role_id || null, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM questions WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get questions for a session
app.get('/api/questions/session/:sessionId', async (req, res) => {
    try {
        const questions = await dbAll(`
            SELECT q.*, c.name as category_name, 
                   co.name as company_name, r.title as role_title
            FROM questions q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN companies co ON q.company_id = co.id
            LEFT JOIN roles r ON q.role_id = r.id
            INNER JOIN practice_session_questions psq ON q.id = psq.question_id
            WHERE psq.session_id = ?
            ORDER BY psq.added_at DESC
        `, [req.params.sessionId]);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ANSWERS ENDPOINTS ==========
app.get('/api/answers/question/:questionId', async (req, res) => {
    try {
        const answers = await dbAll(
            'SELECT * FROM answers WHERE question_id = ? ORDER BY created_at DESC',
            [req.params.questionId]
        );
        res.json(answers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/answers/question/:questionId', async (req, res) => {
    try {
        const { answer_text } = req.body;
        if (!answer_text) {
            return res.status(400).json({ error: 'Answer text is required' });
        }
        
        // Check if question exists
        const question = await dbGet('SELECT id FROM questions WHERE id = ?', [req.params.questionId]);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const result = await dbRun(
            'INSERT INTO answers (question_id, answer_text) VALUES (?, ?)',
            [req.params.questionId, answer_text]
        );
        
        res.status(201).json({ 
            id: result.id, 
            question_id: req.params.questionId, 
            answer_text 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/answers/:id', async (req, res) => {
    try {
        const { answer_text } = req.body;
        if (!answer_text) {
            return res.status(400).json({ error: 'Answer text is required' });
        }
        
        const result = await dbRun(
            'UPDATE answers SET answer_text = ? WHERE id = ?',
            [answer_text, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/answers/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM answers WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== PRACTICE SESSIONS ENDPOINTS ==========
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await dbAll(`
            SELECT ps.*, c.name as company_name, r.title as role_title
            FROM practice_sessions ps
            LEFT JOIN companies c ON ps.company_id = c.id
            LEFT JOIN roles r ON ps.role_id = r.id
            ORDER BY ps.created_at DESC
        `);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sessions/:id', async (req, res) => {
    try {
        const session = await dbGet(`
            SELECT ps.*, c.name as company_name, r.title as role_title
            FROM practice_sessions ps
            LEFT JOIN companies c ON ps.company_id = c.id
            LEFT JOIN roles r ON ps.role_id = r.id
            WHERE ps.id = ?
        `, [req.params.id]);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sessions', async (req, res) => {
    try {
        const { name, company_id, role_id } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Session name is required' });
        }
        
        const result = await dbRun(
            'INSERT INTO practice_sessions (name, company_id, role_id) VALUES (?, ?, ?)',
            [name, company_id || null, role_id || null]
        );
        
        res.status(201).json({ 
            id: result.id, 
            name, 
            company_id: company_id || null,
            role_id: role_id || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/sessions/:id', async (req, res) => {
    try {
        const { name, company_id, role_id } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Session name is required' });
        }
        
        const result = await dbRun(
            'UPDATE practice_sessions SET name = ?, company_id = ?, role_id = ? WHERE id = ?',
            [name, company_id || null, role_id || null, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM practice_sessions WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add question to session
app.post('/api/sessions/:sessionId/questions/:questionId', async (req, res) => {
    try {
        // Check if session exists
        const session = await dbGet('SELECT id FROM practice_sessions WHERE id = ?', [req.params.sessionId]);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        // Check if question exists
        const question = await dbGet('SELECT id FROM questions WHERE id = ?', [req.params.questionId]);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const result = await dbRun(
            'INSERT OR IGNORE INTO practice_session_questions (session_id, question_id) VALUES (?, ?)',
            [req.params.sessionId, req.params.questionId]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove question from session
app.delete('/api/sessions/:sessionId/questions/:questionId', async (req, res) => {
    try {
        const result = await dbRun(
            'DELETE FROM practice_session_questions WHERE session_id = ? AND question_id = ?',
            [req.params.sessionId, req.params.questionId]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Question not found in session' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== OTHER ENDPOINTS ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Interview Reviewer API'
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Interview Reviewer API - Complete Version',
        version: '3.0.0',
        endpoints: {
            categories: 'GET/POST/PUT/DELETE /api/categories',
            companies: 'GET/POST/PUT/DELETE /api/companies',
            roles: 'GET/POST/PUT/DELETE /api/roles',
            questions: 'GET/POST/PUT/DELETE /api/questions',
            answers: 'GET/POST/PUT/DELETE /api/answers',
            sessions: 'GET/POST/PUT/DELETE /api/sessions',
            health: 'GET /api/health',
            test: 'GET /api/test'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Complete Interview Reviewer Backend Started');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('\n📋 Available Endpoints:');
    console.log('   CATEGORIES:    /api/categories');
    console.log('   COMPANIES:     /api/companies');
    console.log('   ROLES:         /api/roles');
    console.log('   QUESTIONS:     /api/questions');
    console.log('   ANSWERS:       /api/answers/question/:questionId');
    console.log('   SESSIONS:      /api/sessions');
    console.log('='.repeat(60));
});