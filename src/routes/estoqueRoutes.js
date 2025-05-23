// src/routes/estoqueRoutes.js
import { Router } from "express";
import {
  getAllProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto
} from "../controllers/estoqueController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllProdutos);
router.get("/:id", getProdutoById);
router.post("/", createProduto);
router.put("/:id", updateProduto);
router.delete("/:id", deleteProduto);

export default router;
