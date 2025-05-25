import caixaService from "../services/caixaService.js";
import gastosService from "../services/gastosService.js";

// GET /api/caixa/atual
export async function getCaixaAtual(req, res, next) {
  try {
    const caixa = await caixaService.getCaixaAberto();
    res.json(caixa || null);
  } catch (err) {
    next(err);
  }
}

// POST /api/caixa/abrir
export async function abrirCaixa(req, res, next) {
  try {
    const { saldoInicial } = req.body;
    if (saldoInicial == null || saldoInicial < 0) {
      return res.status(400).json({ error: "Saldo inicial inválido." });
    }
    const usuarioId = req.usuario.id;
    const caixa = await caixaService.abrir(saldoInicial, usuarioId);
    res.status(201).json(caixa);
  } catch (err) {
    next(err);
  }
}

// POST /api/caixa/fechar/:id
export async function fecharCaixa(req, res, next) {
  try {
    const { id } = req.params;
    const caixa = await caixaService.fechar(Number(id));
    res.json(caixa);
  } catch (err) {
    next(err);
  }
}

// GET /api/caixa/movimentacoes
export async function getMovimentacoesDoDia(req, res, next) {
  try {
    const movs = await caixaService.getMovimentacoes();
    res.json(movs);
  } catch (err) {
    next(err);
  }
}
