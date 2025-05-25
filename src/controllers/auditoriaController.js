import * as service from "../services/auditoriaService.js";

// relatório resumido (já existente)
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

// novo endpoint: intervalo de datas
export async function getRange(req, res, next) {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Parâmetros 'start' e 'end' são obrigatórios." });
    }
    const data = await service.getMovimentosRange(start, end);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
