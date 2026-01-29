const express = require('express');
const app = express();
const PORT = 3001;

app.use(require('cors')());
app.use(require('body-parser').json());

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.get('/test', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});