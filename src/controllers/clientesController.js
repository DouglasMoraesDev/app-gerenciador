// src/controllers/clientesController.js

import clientesService from "../services/clientesService.js";

// GET /api/clientes
export async function getTodosClientes(req, res, next) {
  try {
    const lista = await clientesService.getTodos();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

// GET /api/clientes/:id
export async function getClienteById(req, res, next) {
  try {
    const { id } = req.params;
    const cliente = await clientesService.getPorId(Number(id));
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// POST /api/clientes
export async function criarCliente(req, res, next) {
  try {
    const dados = req.body;
    const novoCli = await clientesService.criar(dados);
    res.status(201).json(novoCli);
  } catch (err) {
    next(err);
  }
}

// PUT /api/clientes/:id
export async function atualizarCliente(req, res, next) {
  try {
    const { id } = req.params;
    const dados = req.body;
    const cliAtualizado = await clientesService.atualizar(Number(id), dados);
    res.json(cliAtualizado);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/clientes/:id
export async function deletarCliente(req, res, next) {
  try {
    const { id } = req.params;
    await clientesService.deletar(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
