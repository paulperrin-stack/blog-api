const { parse } = require('dotenv');
const express = require('express');
const models = require('./models');
const routes = require('./routes');

const app = express();

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Application-level middleware: attach models and session to every request
app.use((req, res, next) => {
    req.context = {
        models,
        me: models.users[1], // Temporarily hard-code the 'logged in' user
    };
    next(); // Always call next() to continue to the next middleware/route
});

// Mount modular routes
app.use('/users', routes.user);
app.use('/posts', routes.post);
app.use('/comments', routes.comment);

// In-memory "database" for now (we will replace with Prisma later)
let posts = [
    { id: 1, title: "First Post", content: "Hello world!", published: true },
    { id: 2, title: "Draft Post", content: "Work in progress", published: false },
];

// GET / posts - return all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// GET / posts/:id - return a single post
app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
});

// POST /posts - create a new post
app.post('/posts', (req, res) => {
    const { title, content } = req.bodyM
    const newPost = {
        id: posts.length + 1,
        title,
        content,
        published: false,
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

// PUT /posts/:id - update a post
app.put('/posts/:id', (req, res) => {
    const index = posts.findIndex (p => p.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    posts[index] = { ...posts[index], ...req.body };
    res.json(posts[index]);
});

// DELETE /posts/:id - delete a post
app.delete('/posts/:id', (req, res) => {
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    const deleted = posts.splice(index, 1);
    res.json(deleted[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});