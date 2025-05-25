import * as parceriaService from "../services/parceiraService.js";

export const listar = async (req, res, next) => {
  try {
    const dados = await parceriaService.getTodasParceiras();
    res.json(dados);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dado = await parceriaService.getParceiraPorId(id);
    if (!dado) return res.status(404).json({ error: "Empresa Parceira não encontrada" });
    res.json(dado);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const { nome, cnpj, descricao, valorMensal, contratoUrl } = req.body;

    if (!nome || !cnpj || !descricao || !valorMensal) {
      return res.status(400).json({ error: "Campos obrigatórios faltando!" });
    }

    const nova = await parceriaService.criarParceira({
      nome,
      cnpj,
      descricao,
      valorMensal: parseFloat(valorMensal),
      contratoUrl: contratoUrl || null,
    });

    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
};


export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atualizado = await parceriaService.atualizarParceira(id, req.body);
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await parceriaService.deletarParceira(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
