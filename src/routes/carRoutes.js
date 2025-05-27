import { Router } from "express";
import { listar, buscarPorId, criar, atualizar, deletar } from "../controllers/carController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/",    listar);      // GET /api/carros
router.get("/:id", buscarPorId); // GET /api/carros/:id
router.post("/",   criar);       // POST /api/carros
router.put("/:id", atualizar);   // PUT /api/carros/:id
router.delete("/:id", deletar);  // DELETE /api/carros/:id

export default router;
