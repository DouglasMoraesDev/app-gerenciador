import caixaService from "../services/caixaService.js";

export async function getCaixaAtual(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const caixa = await caixaService.getCaixaAberto();
    res.json(caixa || null);
  } catch (err) {
    next(err);
  }
}

export async function abrirCaixa(req, res, next) {
  try {
    const { saldoInicial } = req.body;
    const usuarioId = req.usuario.id;
    const caixa = await caixaService.abrir(saldoInicial, usuarioId);
    res.status(201).json(caixa);
  } catch (err) {
    next(err);
  }
}

export async function fecharCaixa(req, res, next) {
  try {
    const { id } = req.params;
    const caixa = await caixaService.fechar(Number(id));
    res.json(caixa);
  } catch (err) {
    next(err);
  }
}

export async function getMovimentacoesDoDia(req, res, next) {
  try {
    const movs = await caixaService.getMovimentacoes();
    res.json(movs);
  } catch (err) {
    next(err);
  }
}