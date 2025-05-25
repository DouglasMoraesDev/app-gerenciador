import * as service from "../services/parceiraService.js";

export const listar = async (req, res, next) => {
  try {
    const list = await service.getTodasParceiras();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await service.getParceiraPorId(id);
    if (!item) return res.status(404).json({ error: "Parceira não encontrada" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const { nome, cnpj, descricao, valorMensal } = req.body;
    if (!nome || !cnpj || !descricao || !valorMensal) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }
    // monta a URL relativa para servir via /uploads
    const contratoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const nova = await service.criarParceira({
      nome,
      cnpj,
      descricao,
      valorMensal: parseFloat(valorMensal),
      contratoUrl
    });
    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atualizado = await service.atualizarParceira(id, req.body);
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.deletarParceira(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
