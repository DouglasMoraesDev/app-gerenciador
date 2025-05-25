import { Router } from "express";
import {
  getTodosServicos,
  getServicoById,
  criarServico,
  atualizarServico,
  deletarServico
} from "../controllers/servicosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rotas protegidas
router.use(authMiddleware);

router.get("/",      getTodosServicos);   // GET /api/servicos
router.get("/:id",   getServicoById);     // GET /api/servicos/:id
router.post("/",     criarServico);       // POST /api/servicos
router.put("/:id",   atualizarServico);   // PUT /api/servicos/:id
router.delete("/:id", deletarServico);    // DELETE /api/servicos/:id

export default router;
