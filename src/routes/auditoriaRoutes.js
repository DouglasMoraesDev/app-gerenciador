import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAudit, getRange } from "../controllers/auditoriaController.js";

const router = Router();
router.use(authMiddleware);

// relatório resumido: ?periodo=mes&valor=YYYY-MM  ou ?periodo=ano&valor=YYYY
router.get("/", getAudit);

// novo: intervalo completo de movimentações
// GET /api/auditoria/range?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/range", getRange);

export default router;
