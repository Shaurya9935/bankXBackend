import { Router } from "express";
import { authenticate, requireRole } from "../../common/middleware/auth.middleware.js";
const router = Router();
router.use(authenticate, requireRole("ADMIN"));
router.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
export default router;