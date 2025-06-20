// src/controllers/auditoriaController.js

import * as service from "../services/auditoriaService.js";

/**
 * Relatório resumido: período “mes” ou “ano”
 * GET /api/auditoria?periodo=mes&valor=YYYY-MM  ou ?periodo=ano&valor=YYYY
 */
export async function getAudit(req, res, next) {
  try {
    const { periodo, valor } = req.query;
    if (!periodo || !valor) {
      return res.status(400).json({ error: "Parâmetros 'periodo' e 'valor' são obrigatórios." });
    }
    const result = await service.generateReport(periodo, valor);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Relatório completo de movimentações em intervalo de datas
 * GET /api/auditoria/range?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export async function getRange(req, res, next) {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Parâmetros 'start' e 'end' são obrigatórios." });
    }
    const { saldoInicial, movimentacoes } = await service.getMovimentosRange(start, end);
    res.json({ saldoInicial, movimentacoes });
  } catch (err) {
    next(err);
  }
}

// Remova este bloco duplicado:
// export { getAudit, getRange };
