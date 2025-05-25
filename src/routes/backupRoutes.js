// src/routes/backupRoutes.js

import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  exportBackup,
  restoreBackup
} from "../controllers/backupController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// Configuração do multer: armazena em "uploads/" com nome original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${timestamp}_${base}${ext}`);
  }
});
const upload = multer({ storage });

const router = Router();

// Todas as rotas de backup exigem autenticação
router.use(authMiddleware);

// GET /api/backup → Download do arquivo JS com todos os dados
router.get("/", exportBackup);

// POST /api/backup/restore → Recebe arquivo JS e restaura dados
router.post("/restore", upload.single("backupFile"), restoreBackup);

export default router;
