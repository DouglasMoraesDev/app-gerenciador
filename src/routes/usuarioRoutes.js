// src/routes/usuarioRoutes.js

import { Router } from "express";
import {
  getUsuarioMe,
  updateUsuarioNome,
  changePassword
} from "../controllers/usuarioController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

// GET /api/usuario/me
router.get("/me", getUsuarioMe);

// PUT /api/usuario/update
router.put("/update", updateUsuarioNome);

// PATCH /api/usuario/change-password
router.patch("/change-password", changePassword);

export default router;
