// src/routes/clientesRoutes.js

import { Router } from "express";
import {
  getTodosClientes,
  getClienteById,
  criarCliente,
  atualizarCliente,
  deletarCliente
} from "../controllers/clientesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/",      getTodosClientes);   // GET /api/clientes
router.get("/:id",   getClienteById);     // GET /api/clientes/:id
router.post("/",     criarCliente);       // POST /api/clientes
router.put("/:id",   atualizarCliente);   // PUT /api/clientes/:id
router.delete("/:id", deletarCliente);    // DELETE /api/clientes/:id

export default router;
