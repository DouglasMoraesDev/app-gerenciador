// src/controllers/osController.js

import prisma from "../prismaClient.js";
import osService from "../services/osService.js";
import caixaService from "../services/caixaService.js";

// GET /api/os
export async function getTodasOS(req, res) {
  try {
    const lista = await osService.getTodas();
    res.json(lista);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/os/:id
export async function getOSById(req, res) {
  try {
    const { id } = req.params;
    const os = await osService.getPorId(Number(id));
    if (!os) return res.status(404).json({ error: "OS não encontrada" });
    return res.json(os);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/os
export async function criarOS(req, res) {
  try {
  const { carroId, servicoId, valorServico } = req.body;
    if (!carroId || !servicoId) {
      return res.status(400).json({ error: "Carro e serviço são obrigatórios." });
    }

    const novaOs = await osService.criar({
      carroId: Number(carroId),
      servicoId: Number(servicoId),
      valorServico: valorServico !== undefined ? parseFloat(valorServico) : undefined
    });
    res.status(201).json(novaOs);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// PUT /api/os/:id
export async function atualizarOS(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;
    const os = await osService.atualizar(Number(id), dados);
    return res.json(os);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// DELETE /api/os/:id
export async function deletarOS(req, res) {
  try {
    const { id } = req.params;
    await osService.deletar(Number(id));
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PATCH /api/os/:id/status
export async function patchStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, modalidadePagamento } = req.body;
    const osFinalizada = await osService.patchStatus(
      Number(id),
      status,
      modalidadePagamento,
      req.usuario.id
    );
    return res.json(osFinalizada);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/os/parceiro
 * Query params: parceiroId (número), start (YYYY-MM-DD), end (YYYY-MM-DD)
 */
export async function getOSPorParceiro(req, res, next) {
  try {
    const { parceiroId: pId, start, end } = req.query;

    // 1) Validação básica dos parâmetros
    if (!pId || !start || !end) {
      return res
        .status(400)
        .json({ error: "É necessário fornecer parceiroId, start e end na query." });
    }

    // 2) Converter parceiroId para inteiro e validar
    const parceiroId = parseInt(pId, 10);
    if (isNaN(parceiroId)) {
      return res.status(400).json({ error: "parceiroId deve ser um número inteiro." });
    }

    // 3) Converter datas
    const dtStart = new Date(start);
    const dtEnd = new Date(end);
    if (isNaN(dtStart.getTime()) || isNaN(dtEnd.getTime())) {
      return res
        .status(400)
        .json({ error: "start e end devem estar no formato YYYY-MM-DD válidos." });
    }
    // Ajusta hora do fim do dia para incluir todas as OS até 23:59:59
    dtEnd.setHours(23, 59, 59, 999);

    // 4) Verificar se a empresa parceira existe (opcional, mas ajuda a evitar busca inútil)
    const parceiro = await prisma.empresaParceira.findUnique({
      where: { id: parceiroId },
    });
    if (!parceiro) {
      return res.status(404).json({ error: "Empresa parceira não encontrada." });
    }

    // 5) Buscar ordens de serviço filtrando por parceiroId e intervalo de datas
    const lista = await prisma.ordemServico.findMany({
      where: {
        parceiroId: parceiroId,
        criadoEm: { gte: dtStart, lte: dtEnd },
      },
      include: {
        cliente: true,
        servico: true,
      },
    });

    return res.json(lista);
  } catch (err) {
    console.error("Erro em getOSPorParceiro:", err);
    return res.status(500).json({ error: "Erro interno ao buscar OS do parceiro." });
  }
}
