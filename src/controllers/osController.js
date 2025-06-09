import osService from "../services/osService.js";
import prisma from "../prismaClient.js";
import { formatBRL } from "../../public/js/utils/format.js";

/**
 * GET /api/os
 */
export async function getTodasOS(req, res, next) {
  try {
    const lista = await osService.getTodas();
    lista.forEach(o =>
      o.itens.forEach(i =>
        i.valorServico = formatBRL(i.valorServico)
      )
    );
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/os/:id
 */
export async function getOSById(req, res, next) {
  try {
    const os = await osService.getPorId(Number(req.params.id));
    if (!os) return res.status(404).json({ error: "OS não encontrada" });
    os.itens.forEach(i => i.valorServico = formatBRL(i.valorServico));
    res.json(os);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/os
 */
export async function criarOS(req, res, next) {
  try {
    const { plate, model, parceiroId, itens } = req.body;
    const nova = await osService.criar({ plate, model, parceiroId, itens });
    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/os/:id
 */
export async function atualizarOS(req, res, next) {
  try {
    const atualizada = await osService.atualizar(Number(req.params.id), req.body);
    res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/os/:id
 */
export async function deletarOS(req, res, next) {
  try {
    await osService.deletar(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/os/:id/status
 */
export async function patchStatus(req, res, next) {
  try {
    const { status, modalidadePagamento } = req.body;
    const os = await osService.patchStatus(
      Number(req.params.id),
      status,
      modalidadePagamento,
      req.usuario.id
    );
    res.json(os);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/os/parceiro?parceiroId=&start=&end=
 */
export async function getOSPorParceiro(req, res, next) {
  try {
    const { parceiroId, start, end } = req.query;
    if (!parceiroId || !start || !end) {
      return res.status(400).json({ error: "parceiroId, start e end são obrigatórios." });
    }
    const dtStart = new Date(start);
    const dtEnd = new Date(end);
    dtEnd.setHours(23,59,59,999);

    const lista = await prisma.ordemServico.findMany({
      where: { parceiroId: Number(parceiroId), criadoEm: { gte: dtStart, lte: dtEnd } },
      include: { itens: { include: { servico: true } }, parceiro: true }
    });
    lista.forEach(o => o.itens.forEach(i => i.valorServico = formatBRL(i.valorServico)));
    res.json(lista);
  } catch (err) {
    next(err);
  }
}
