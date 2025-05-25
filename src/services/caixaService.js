import prisma from "../prismaClient.js";

/**
 * Retorna o caixa aberto (dataFechamento == null).
 */
async function getCaixaAberto() {
  return prisma.caixa.findFirst({
    where: { dataFechamento: null },
    include: { usuario: true }
  });
}

/**
 * Abre um novo caixa se não houver nenhum aberto.
 */
async function abrir(saldoInicial, usuarioId) {
  const aberto = await getCaixaAberto();
  if (aberto) {
    throw Object.assign(new Error("Já existe um caixa aberto"), { status: 400 });
  }
  return prisma.caixa.create({
    data: {
      dataAbertura: new Date(),
      saldoInicial,
      entradas: 0,
      saidas: 0,
      usuario: { connect: { id: usuarioId } }
    },
    include: { usuario: true }
  });
}

/**
 * Fecha o caixa e calcula saldo final = saldoInicial + entradas - saídas.
 */
async function fechar(id) {
  const caixa = await prisma.caixa.findUnique({ where: { id } });
  if (!caixa) {
    throw Object.assign(new Error("Caixa não encontrado"), { status: 404 });
  }
  if (caixa.dataFechamento) {
    throw Object.assign(new Error("Caixa já está fechado"), { status: 400 });
  }
  const saldoFinal = caixa.saldoInicial + caixa.entradas - caixa.saidas;
  return prisma.caixa.update({
    where: { id },
    data: {
      dataFechamento: new Date(),
      saldoFinal
    },
    include: { usuario: true }
  });
}

/**
 * Retorna movimentações do dia corrente (entrada e saída),
 * incluindo informações de usuário e, se for, de OS ou gasto.
 */
async function getMovimentacoes() {
  const caixa = await getCaixaAberto();
  if (!caixa) return [];
  // Encontrar movimentações cujo createdAt seja hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  return prisma.caixaMov.findMany({
    where: {
      caixaId: caixa.id,
      createdAt: { gte: hoje, lt: amanha }
    },
    include: {
      usuario: true,
      ordem: true
    },
    orderBy: { createdAt: "asc" }
  });
}

/**
 * Registra qualquer movimentação no caixa (entrada ou saída).
 * Usado por serviços de OS e gastos.
 */
async function registrarMovimentacao({ tipo, valor, usuarioId, caixaId, ordemId }) {
  // Cria movimentação
  const mov = await prisma.caixaMov.create({
    data: {
      tipo,
      valor,
      usuario: { connect: { id: usuarioId } },
      caixa: { connect: { id: caixaId } },
      ordem: ordemId ? { connect: { id: ordemId } } : undefined
    }
  });
  // Atualizar soma de entradas ou saídas no caixa
  if (tipo === "ENTRADA") {
    await prisma.caixa.update({
      where: { id: caixaId },
      data: { entradas: { increment: valor } }
    });
  } else {
    await prisma.caixa.update({
      where: { id: caixaId },
      data: { saidas: { increment: valor } }
    });
  }
  return mov;
}

export default {
  getCaixaAberto,
  abrir,
  fechar,
  getMovimentacoes,
  registrarMovimentacao
};
