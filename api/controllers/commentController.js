import prisma from "../config/prisma.js";

export const getComments = async (req, res, next) => {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: Number(req.params.postId) },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(comments);
    } catch (err) { next(err); }
};

export const addComment = async (req, res, next) => {
    try {
        const comment = await prisma.comment.create({
            data: {
                content: req.body.content,
                postId: Number(req.params.postId),
                userId: req.user.id,
            },
            include: { user: { select: { username: true } } },
        });
        res.status(201).json(comment);
    } catch (err) { next(err); }
};

export const deleteComment = async (req, res, next) => {
    try {
        await prisma.comment.delete({ where: { id: Number(req.params.id) } });
        res.status(204).end();
    } catch (err) { next(err); }
};