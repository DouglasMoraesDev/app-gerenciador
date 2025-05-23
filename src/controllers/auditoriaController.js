import * as service from '../services/auditoriaService.js';

export async function getAudit(req, res, next) {
  try {
    const result = await service.generateReport(req.query.mes);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
