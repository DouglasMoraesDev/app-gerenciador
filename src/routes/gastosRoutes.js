import { Router } from "express";
import {
  getTodosGastos,
  criarGasto,
  deletarGasto
} from "../controllers/gastosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/",   getTodosGastos);   // GET /api/gastos
router.post("/",  criarGasto);       // POST /api/gastos
router.delete("/:id", deletarGasto); // DELETE /api/gastos/:id

export default router;
