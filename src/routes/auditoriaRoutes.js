import { Router } from "express";
import { getAudit } from "../controllers/auditoriaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

// GET /api/auditoria?periodo=mes&valor=YYYY-MM
// ou   /api/auditoria?periodo=ano&valor=YYYY
router.get("/", getAudit);

export default router;
