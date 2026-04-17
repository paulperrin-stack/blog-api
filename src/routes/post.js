const { Router } = require('express');
const router = Router();

// GET /posts
router.get('/', (req, res) => {
    res.json(Object.values(req.context.models.posts));
});

// GET /posts/:id
router.get('/:id', (req, res) => {
    const post = req.context.models.posts[req.params.id];
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
});

// POST /posts - create
router.post('/', (req, res) => {
    const { title, content } = req.body;
    const id = String(Date.now());
    const newPost = { id, title, content, userId: req.context.me.id, published: false };
    res.status(201).json(newPost);
});

// PUT /posts/:id - update
router.put('/:id', (req, res) => {
    const post = req.context.models.posts[req.params.id];
    if (!post) return res.status(404).json({ error: "Post not found" });
    req.context.models.posts[req.params.id] = { ...post, ...req.body };
    res.json(req.context.models.posts[req.params.id]);
});

// DELETE /posts/:id
router.delete('/:id', (req, res) => {
    const post = req.context.models.posts[req.params.id];
    if (!post) return res.status(404).json({ error: "Post not found" });
    delete req.context.models.posts[req.params.id];
    res.json(post);
});

module.exports = router;