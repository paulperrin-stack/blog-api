const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const prisma = require('../db');

const router = Router();

// POST /auth/register - creates a new user account
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate that all required fields are present
        if (!username || !email | !password ) {
            return res.status(400).json({ error: 'username, email, and password are all required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            isAuthor: user.isAuthor,
            createdAt: user.createdAt,
        });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'That email or username is already taken' });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /auth/login - exchange credentials for a JWT
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({ error: info?.message || 'Login failed' });
        }

        //Create the JWT payload
        const payload = {
            userId: user.id,
            email: user.email,
            isAuthor: user.isAuthor,
        };

        // Sign the token - expires in 1 day
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        return res.json({ token });
    }) (req, res, next);
});

module.exports = router;