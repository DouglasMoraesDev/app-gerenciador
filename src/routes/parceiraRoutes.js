import express from "express";
import path from "path";
import multer from "multer";
import * as controller from "../controllers/parceiraController.js";

// Multer: armazena em uploads/, preservando .pdf
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname); // “.pdf”
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");
    cb(null, `${timestamp}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Somente PDF permitido"));
    }
    cb(null, true);
  }
});

const router = express.Router();

router.get("/",    controller.listar);
router.get("/:id", controller.buscarPorId);
// multipart/form-data com campo “contrato”
router.post("/",   upload.single("contrato"), controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.deletar);

export default router;
