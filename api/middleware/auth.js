import passport from "passport";

export const requireAuth = passport.authenticate("jwt", { session: false });

export const requireAuthor = (req, res, next) => {
    if (!req.user?.isAuthor) {
        return res.status(403).json({ message: "Author access required" });
    }
    next();
};