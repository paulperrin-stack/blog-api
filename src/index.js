require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const routes = require('./routes');

const app = express();

// Middleware
app.use(
    cors({ 
        origin: process.env.FRONTEND_URL || "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());

app.use(passport.initialize());

// Routes
app.use('/auth', routes.auth);
app.use('/posts', routes.post);
app.use('/users', routes.user);

// Nested route: /posts/:postId/comments
app.use('/posts/:postId/comments', routes.comment);

// Health check - useful for deployment platforms
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});