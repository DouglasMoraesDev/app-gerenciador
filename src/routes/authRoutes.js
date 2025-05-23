import { Router } from "express";
import { login, register } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register  → cria novo usuário
router.post("/register", register);

// POST /api/auth/login     → faz login e retorna JWT
router.post("/login", login);

export default router;
