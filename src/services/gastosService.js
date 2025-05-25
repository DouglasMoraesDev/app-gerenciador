import prisma from "../prismaClient.js";

/**
 * Retorna todos os gastos registrados.
 */
async function getTodos() {
  return prisma.gasto.findMany({
    include: { usuario: true }
  });
}

/**
 * Cria um novo gasto; retorna gasto recém-criado.
 * Recebe o ID da movimentação de caixa (movCaixaId) já criado anteriormente.
 */
async function criar({ categoria, descricao, valor, data, usuarioId, movCaixaId }) {
  // Cria o gasto vinculado à movimentação do caixa
  return await prisma.gasto.create({
    data: {
      categoria,
      descricao,
      valor,
      data: data ? new Date(data) : new Date(),
      usuario: { connect: { id: usuarioId } },
      movCaixa: { connect: { id: movCaixaId } }
    },
    include: { usuario: true }
  });
}

/**
 * Deleta gasto e reverte movimentação no caixa.
 */
async function deletar(id) {
  // Buscar gasto para saber valor e movCaixa
  const gasto = await prisma.gasto.findUnique({ where: { id }, include: { movCaixa: true } });
  if (!gasto) {
    throw Object.assign(new Error("Gasto não encontrado"), { status: 404 });
  }

  const movId = gasto.movCaixaId;
  const valor = gasto.valor;

  // Deletar gasto
  await prisma.gasto.delete({ where: { id } });

  // Reverter movimentação (subtrair de saídas) e deletar mov no caixa
  if (movId) {
    const mov = await prisma.caixaMov.findUnique({ where: { id: movId } });
    if (mov) {
      // Atualizar soma de saídas no caixa
      await prisma.caixa.update({
        where: { id: mov.caixaId },
        data: { saidas: { decrement: valor } }
      });
      // Deletar a movimentação do caixa
      await prisma.caixaMov.delete({ where: { id: movId } });
    }
  }
}

export default {
  getTodos,
  criar,
  deletar
};
