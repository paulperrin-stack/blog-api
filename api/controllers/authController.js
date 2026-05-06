import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import prisma from "../config/prisma.js";

export const signup = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashed },
        });
        res.status(201).json({ id: user.id, username: user.username });
    } catch (err) {
        next(err);
    }
};

export const login = (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message });
        const token = jwt.sign(
            { sub: user.id, username: user.username, isAuthor: user.isAuthor },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            token,
            user: { id: user.id, username: user.username, isAuthor: user.isAuthor },
        });
    }) (req, res, next);
};