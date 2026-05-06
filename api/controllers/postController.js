import prisma from "../config/prisma.js";

export const getAllPosts = async (req, res, next) => {
    try {
        const where = req.user?.isAuthor ? {} : { published: true};
        const posts = await prisma.post.findMany({
            where,
            include: { author: { select: { username: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(posts);
    } catch (err) { next(err); }
};

export const getPost = async (req, res, next) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                comments: {
                    include: { user: { select: { username: true } } },
                    orderBy: { createdAt: "desc" },
                },
                author: { select: { username: true } },
            },
        });
        if (!post) return res.status(404).json({ message: "Not found" });
        if (!post.published && !req.user?.isAuthor) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json(post);
    } catch (err) { next(err); }
};

export const createPost = async (req, res, next) => {
    try {
        const { title, content, published = false } = req.body;
        const post = await prisma.post.create({
            data: { title, content, published, authorId: req.user.id },
        });
        res.status(201).json(post);
    } catch (err) { next(err); }
};

export const updatePost = async (req, res, next) => {
    try {
        const post = await prisma.post.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json(post);
    } catch (err) { next(err); }
};

export const deletePost = async (req, res, next) => {
    try {
        await prisma.post.delete({ where: { id: Number(req.params.id) } });
        res.status(204).end();
    } catch (err) { next(err); }
};