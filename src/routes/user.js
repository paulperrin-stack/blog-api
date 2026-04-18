import { Router } from 'express';
import prisma from '../db.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        isAuthor: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true },
        },
      },
    });

    res.json(user);
  } catch (err) {
    console.error('GET /users/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        email: true,
        isAuthor: true,
        createdAt: true,
        posts: {
          where: { published: true },
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
