import { Router } from "express";
import {
  getTodasOS,
  getOSById,
  criarOS,
  atualizarOS,
  deletarOS
} from "../controllers/osController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware); // todas as rotas abaixo requerem autenticação

router.get("/", getTodasOS);          // GET /api/os
router.get("/:id", getOSById);        // GET /api/os/:id
router.post("/", criarOS);            // POST /api/os
router.put("/:id", atualizarOS);      // PUT /api/os/:id
router.delete("/:id", deletarOS);     // DELETE /api/os/:id

export default router;