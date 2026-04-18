import { Router } from 'express';
import prisma from '../db.js';
import authenticate from '../middleware/authenticate.js';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      include: {
        author: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (err) {
    console.error('GET /posts/:postId/comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
    });

    if (!post || !post.published) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        authorId: req.user.id,
        postId: req.params.postId,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /posts/:postId/comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:commentId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
      include: { post: true },
    });

    if (!comment || comment.postId !== req.params.postId) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isCommentAuthor = comment.authorId === req.user.id;
    const isPostAuthor = comment.post.authorId === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Not allowed to edit this comment' });
    }

    const updated = await prisma.comment.update({
      where: { id: req.params.commentId },
      data: { text: text.trim() },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
      include: { post: true },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isCommentAuthor = comment.authorId === req.user.id;
    const isPostAuthor = comment.post.authorId === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Not allowed to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: req.params.commentId } });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
