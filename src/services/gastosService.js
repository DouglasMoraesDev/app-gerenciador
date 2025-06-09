// services/gastosService.js

import prisma from "../prismaClient.js";

async function getTodos() {
  return prisma.gasto.findMany({
    include: { usuario: true }
  });
}

async function criar({ descricao, valor, data, usuarioId, movCaixaId }) {
  return await prisma.gasto.create({
    data: {
      descricao,
      valor,
      data: data ? new Date(data) : new Date(),
      usuario: { connect: { id: usuarioId } },
      movCaixa: { connect: { id: movCaixaId } }
    },
    include: { usuario: true }
  });
}

async function deletar(id) {
  const gasto = await prisma.gasto.findUnique({ where: { id }, include: { movCaixa: true } });
  if (!gasto) {
    throw Object.assign(new Error("Gasto não encontrado"), { status: 404 });
  }

  const movId = gasto.movCaixaId;
  const valor = gasto.valor;

  await prisma.gasto.delete({ where: { id } });

  if (movId) {
    const mov = await prisma.caixaMov.findUnique({ where: { id: movId } });
    if (mov) {
      await prisma.caixa.update({
        where: { id: mov.caixaId },
        data: { saidas: { decrement: valor } }
      });
      await prisma.caixaMov.delete({ where: { id: movId } });
    }
  }
}

export default {
  getTodos,
  criar,
  deletar
};
