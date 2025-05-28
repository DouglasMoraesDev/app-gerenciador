import * as service from "../services/carService.js";

export const listar = async (req, res, next) => {
  try {
    const carros = await service.getTodosCarros();
    res.json(carros);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const carro = await service.getCarroPorId(id);
    if (!carro) return res.status(404).json({ error: "Carro não encontrado" });
    res.json(carro);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const { proprietario, telefone, email, modelo, placa } = req.body;
    if (!proprietario || !placa) {
      return res.status(400).json({ error: "Proprietário e placa são obrigatórios" });
    }
    const novoCarro = await service.criarCarro({ proprietario, telefone, email, modelo, placa });
    res.status(201).json(novoCarro);
  } catch (err) {
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atualizado = await service.atualizarCarro(id, req.body);
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.deletarCarro(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
