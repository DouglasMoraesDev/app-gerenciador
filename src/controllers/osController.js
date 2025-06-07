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
    // EXTRAÍMOS parceiroId (opcional) do corpo
    const { carroId, servicoId, valorServico, parceiroId } = req.body;

    if (!carroId || !servicoId) {
      return res.status(400).json({ error: "Carro e serviço são obrigatórios." });
    }

    // Montamos o objeto que será enviado ao service
    const dadosParaCriar = {
      carroId: Number(carroId),
      servicoId: Number(servicoId),
      valorServico: valorServico !== undefined ? parseFloat(valorServico) : undefined
    };

    // Se parceiroId foi enviado e não for vazio, já o incluímos
    if (parceiroId) {
      dadosParaCriar.parceiroId = Number(parceiroId);
    }

    const novaOs = await osService.criar(dadosParaCriar);
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
    const os   = await osService.atualizar(Number(id), dados);
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
    // req.usuario.id vem do authMiddleware
    const osFinalizada = await osService.patchStatus(
      Number(id),
      status,
      modalidadePagamento,
      req.usuario.id
    );
    return res.json(osFinalizada);
  } catch (err) {
    // Se o service jogou um erro com `.status = 400` ou outro, retorna esse status
    const statusCode = err.status || 500;
    return res.status(statusCode).json({ error: err.message });
  }
}

/**
 * GET /api/os/parceiro
 * Query params: parceiroId (número), start (YYYY-MM-DD), end (YYYY-MM-DD)
 * Retorna todas as OS de um parceiro num intervalo de datas.
 */
export async function getOSPorParceiro(req, res, next) {
  try {
    const { parceiroId: pId, start, end } = req.query;

    if (!pId || !start || !end) {
      return res
        .status(400)
        .json({ error: "É necessário fornecer parceiroId, start e end na query." });
    }

    const parceiroId = parseInt(pId, 10);
    if (isNaN(parceiroId)) {
      return res.status(400).json({ error: "parceiroId deve ser um número inteiro." });
    }

    const dtStart = new Date(start);
    const dtEnd   = new Date(end);
    if (isNaN(dtStart.getTime()) || isNaN(dtEnd.getTime())) {
      return res.status(400).json({ error: "start e end devem estar no formato YYYY-MM-DD válidos." });
    }
    dtEnd.setHours(23, 59, 59, 999);

    // Verifica se a empresa parceira existe
    const parceiro = await prisma.empresaParceira.findUnique({
      where: { id: parceiroId },
    });
    if (!parceiro) {
      return res.status(404).json({ error: "Empresa parceira não encontrada." });
    }

    // Busca as OS filtrando pelo parceiroId e período
    const lista = await prisma.ordemServico.findMany({
      where: {
        parceiroId,
        criadoEm: { gte: dtStart, lte: dtEnd }
      },
      include: {
        carro:   true,
        servico: true,
        parceiro: true,         // incluir dados da empresa parceira também
      },
    });

    return res.json(lista);
  } catch (err) {
    console.error("Erro em getOSPorParceiro:", err);
    return res.status(500).json({ error: "Erro interno ao buscar OS do parceiro." });
  }
}
