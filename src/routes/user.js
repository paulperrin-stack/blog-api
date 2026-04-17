const { Router } = require('express');
const router = Router();

// GET / users - list all users
router.get('/', (req, res) => {
    const users = Object.values(req.context.models.users);
    res.json(users);
});

// GET /users/:id - get a single user
router.get('/:id', (req, res) => {
    const user = req.context.models.users[req.params.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

module.exports = router;