import { Router } from "express";
import passport from "passport";
import * as ctrl from "../controllers/postController.js";
import { requireAuth, requireAuthor } from "../middleware/auth.js";

const router = Router();

const optionalAuth = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (_err, user) => {
        if (user) req.user = user;
        next();
    })(req, res, next);
};

router.get("/", optionalAuth, ctrl.getAllPosts);
router.get("/:id", optionalAuth, ctrl.getPost);
router.post("/", requireAuth, requireAuthor, ctrl.createPost);
router.put("/:id", requireAuth, requireAuthor, ctrl.updatePost);
router.delete("/:id", requireAuth, requireAuthor, ctrl.deletePost);

export default router;