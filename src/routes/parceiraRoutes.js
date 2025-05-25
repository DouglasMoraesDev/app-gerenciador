import express from "express";
import * as parceriaController from "../controllers/parceiraController.js";


const router = express.Router();

router.get("/", parceriaController.listar);
router.get("/:id", parceriaController.buscarPorId);
router.post("/", parceriaController.criar);
router.put("/:id", parceriaController.atualizar);
router.delete("/:id", parceriaController.deletar);

export default router;
