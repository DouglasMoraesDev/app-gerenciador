// controllers/gastosController.js

import gastosService from "../services/gastosService.js";
import caixaService from "../services/caixaService.js";

// GET /api/gastos
export async function getTodosGastos(req, res, next) {
  try {
    const lista = await gastosService.getTodos();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

// POST /api/gastos
export async function criarGasto(req, res, next) {
  try {
    // Lê apenas descricao, valor e data
    const { descricao, valor, data } = req.body;
    if (!descricao || valor == null) {
      return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
    }
    if (valor <= 0) {
      return res.status(400).json({ error: "Valor deve ser maior que zero." });
    }

    // 1) Obter o caixa aberto
    const caixa = await caixaService.getCaixaAberto();
    if (!caixa) {
      return res.status(400).json({ error: "Você precisa abrir o caixa antes de registrar gastos." });
    }

    // 2) Registrar movimentação de saída no caixa
    const mov = await caixaService.registrarMovimentacao({
      tipo: "SAIDA",
      valor,
      usuarioId: req.usuario.id,
      caixaId: caixa.id,
      ordemId: null
    });

    // 3) Criar o gasto (sem categoria)
    const gasto = await gastosService.criar({
      descricao,
      valor,
      data,
      usuarioId: req.usuario.id,
      movCaixaId: mov.id
    });

    res.status(201).json(gasto);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/gastos/:id
export async function deletarGasto(req, res, next) {
  try {
    const { id } = req.params;
    await gastosService.deletar(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
