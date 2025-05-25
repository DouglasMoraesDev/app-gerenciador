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
 * Já cria movimentação no caixa e devolve movCaixaId.
 */
async function criar({ categoria, descricao, valor, data, usuarioId }) {
  // Obter caixa aberto
  const caixa = await prisma.caixa.findFirst({ where: { dataFechamento: null } });
  if (!caixa) {
    throw Object.assign(new Error("Nenhum caixa aberto para registrar saída"), { status: 400 });
  }
  // Criar movimentação no caixa
  const mov = await prisma.caixaMov.create({
    data: {
      tipo: "SAIDA",
      valor,
      usuario: { connect: { id: usuarioId } },
      caixa: { connect: { id: caixa.id } }
    }
  });
  // Atualizar soma de saídas
  await prisma.caixa.update({
    where: { id: caixa.id },
    data: { saidas: { increment: valor } }
  });
  // Criar gasto, vinculando mov.
  return prisma.gasto.create({
    data: {
      categoria,
      descricao,
      valor,
      data: data ? new Date(data) : new Date(),
      usuario: { connect: { id: usuarioId } },
      movCaixa: { connect: { id: mov.id } }
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
  // Reverter movimentação (subtrair de saidas) e deletar mov no caixa
  if (movId) {
    const mov = await prisma.caixaMov.findUnique({ where: { id: movId } });
    if (mov) {
      // Atualizar caixa
      await prisma.caixa.update({
        where: { id: mov.caixaId },
        data: { saidas: { decrement: valor } }
      });
      // Deletar a movimentação
      await prisma.caixaMov.delete({ where: { id: movId } });
    }
  }
}

export default {
  getTodos,
  criar,
  deletar
};
