const { Router } = require('express');
const prisma = require('../db');
const authenticate = require('../middleware/authenticate');

const router = Router();

// GET /posts - public, filtered by published
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { published: true },
                include: {
                    author: {
                        select: { id: true, username: true }, // never include password
                    },
                    _count: { select: { comments: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.post.count({ where: { published: true } }),
        ]);

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: posts,
        });
    } catch (err) {
        console.error('GET /posts error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /posts/all - protected - authors only
router.get('/all', authenticate, async (req, res) => {
    try {
        if (!req.user.authorId) {
            return res.status(403).json({ error: 'Authors only' });
        }

        const posts = await prisma.post.findMany({
            include: {
                author: { select: { id: true, username: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (err) {
        console.error('GET /posts/all error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /posts/:id - public
router.get('/:id', async (req, res) => {
    try {
        const post = await prisma .post.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { id: true, username: true } },
                comments: { include: { author: { select: { id: true, username: true } },
            },
            orderBy: { createdAt: 'asc' },
            },
        },        
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.published && (!req.user || req.user.id !== post.authorId)) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);

    } catch (err) { 
        console.error('GET /posts/:id error:', err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /posts - protected, authors only
router.post('/', authenticate, async (req, res) => {
    try {
        if (!req.user.isAuthor) {
            return res.status(403).json({ error: 'Only authors can create posts' });
        }

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'title and content are required' });
        }

        const post = await prisma.post.created({
            data: {
                title,
                content,
                authorId: req.user.id,
                // published defaults to false in the schema
            },
            include: {
                author: { select: { id: true, username: true } },
            },
        });

        res.status(201).json(post);

    } catch (err) {
        console.error('POST /posts error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /posts/:id - toggle publis, update content
router.put('/:id', authenticate, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({ where: { id: req.params.id } });

        if (!post) return res.status(404).json({ error: "Not found" });

        if (post.authorId !== req.user.id) return res.status(403).json({ error: "You can only edit your own posts" });

        const updated = await prisma.post.updated({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...Router(published !== undefined && { published }),
            },
            include: {
                author: { select: { id: true, username: true } },
            },
        });

        res.json(updated);

    } catch (err) {
        console.error('PUT /posts/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /posts/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({ 
            where: { id: req.params.id } 
        });

        if (!post) { 
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        // Delete all comments on this post first to avoid foreign key errors
        await prisma.comment.deleteMany({ where: { postId: req.params.id } });
        
        await prisma.post.delete({ where: { id: req.params.id } });

        res.json({ message: "Deleted" });
    } catch (err) {
        console.error('DELETE /posts/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;