// src/controllers/estoqueController.js
import * as service from "../services/estoqueService.js";

// GET /api/estoque
export async function getAllProdutos(req, res, next) {
  try {
    const list = await service.fetchAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

// GET /api/estoque/:id
export async function getProdutoById(req, res, next) {
  try {
    const prod = await service.fetchById(Number(req.params.id));
    if (!prod) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(prod);
  } catch (err) {
    next(err);
  }
}

// POST /api/estoque
export async function createProduto(req, res, next) {
  try {
    const newP = await service.create(req.body);
    res.status(201).json(newP);
  } catch (err) {
    next(err);
  }
}

// PUT /api/estoque/:id
export async function updateProduto(req, res, next) {
  try {
    const upd = await service.update(Number(req.params.id), req.body);
    res.json(upd);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/estoque/:id
export async function deleteProduto(req, res, next) {
  try {
    await service.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
