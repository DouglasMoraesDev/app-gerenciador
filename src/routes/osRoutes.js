import { Router } from "express";
import {
  getTodasOS,
  getOSById,
  criarOS,
  atualizarOS,
  getOSPorParceiro,
  deletarOS,
  patchStatus
} from "../controllers/osController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas de OS exigem autenticação
router.use(authMiddleware);

router.get("/",    getTodasOS);             // GET /api/os
router.get("/parceiro", getOSPorParceiro);
router.get("/:id", getOSById);              // GET /api/os/:id
router.post("/",   criarOS);                // POST /api/os
router.put("/:id", atualizarOS);             // PUT /api/os/:id
router.delete("/:id", deletarOS);             // DELETE /api/os/:id
router.patch("/:id/status", patchStatus);   // PATCH /api/os/:id/status

export default router;
