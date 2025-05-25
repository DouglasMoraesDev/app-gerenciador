import * as service from "../services/auditoriaService.js";

// GET /api/auditoria?periodo=mes&valor=YYYY-MM
// ou   /api/auditoria?periodo=ano&valor=YYYY
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
