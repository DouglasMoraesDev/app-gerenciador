import { Router } from "express";
import {
  getCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  getMovimentacoesDoDia
} from "../controllers/caixaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/atual", getCaixaAtual);                     // GET /api/caixa/atual
router.post("/abrir", abrirCaixa);                       // POST /api/caixa/abrir
router.post("/fechar/:id", fecharCaixa);                 // POST /api/caixa/fechar/:id
router.get("/movimentacoes", getMovimentacoesDoDia);     // GET /api/caixa/movimentacoes

export default router;