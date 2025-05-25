import prisma from "../prismaClient.js";
import osService from "../services/osService.js";
import caixaService from "../services/caixaService.js";

// GET /api/os
export async function getTodasOS(req, res) {
  try {
    // Inclui dados de cliente e serviço
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
    const { clienteId, servicoId } = req.body;
    if (!clienteId || !servicoId) {
      return res.status(400).json({ error: "Cliente e serviço são obrigatórios." });
    }

    // Criar a OS via service (que copia descrição e valor do serviço)
    const novaOs = await osService.criar(req.body);
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
    // Atualiza status e, se finalizada, registra movimentação no caixa
    const osFinalizada = await osService.patchStatus(Number(id), status, modalidadePagamento, req.usuario.id);
    return res.json(osFinalizada);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
