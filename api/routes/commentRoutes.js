import { Router } from "express";
import * as ctrl from "../controllers/commentController.js";
import { requireAuth, requireAuthor } from "../middleware/auth.js";

const router = Router({ mergeParams: true });
router.get("/", ctrl.getComments);
router.post("/", requireAuth, ctrl.addComment);
router.delete("/:id", requireAuth, requireAuthor, ctrl.deleteComment);
export default router;