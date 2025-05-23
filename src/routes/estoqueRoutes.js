import * as service from '../services/estoqueService.js';

export async function getAllProdutos(req, res, next) {
  try {
    const list = await service.fetchAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getProdutoById(req, res, next) {
  try {
    const prod = await service.fetchById(+req.params.id);
    res.json(prod);
  } catch (err) {
    next(err);
  }
}

export async function createProduto(req, res, next) {
  try {
    const newP = await service.create(req.body);
    res.status(201).json(newP);
  } catch (err) {
    next(err);
  }
}

export async function updateProduto(req, res, next) {
  try {
    const upd = await service.update(+req.params.id, req.body);
    res.json(upd);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduto(req, res, next) {
  try {
    await service.remove(+req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
