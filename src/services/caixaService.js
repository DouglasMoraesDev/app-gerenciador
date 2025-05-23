import prisma from "../prismaClient.js";

// Retorna o caixa aberto mais recente (sem dataFechamento)
async function getCaixaAberto() {
  return prisma.caixa.findFirst({
    where: { dataFechamento: null },
    include: { usuario: true }
  });
}

// Abre um novo caixa, se não houver nenhum aberto
async function abrir(saldoInicial, usuarioId) {
  const aberto = await getCaixaAberto();
  if (aberto) {
    throw new Error("Já existe um caixa aberto");
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

// Fecha o caixa atual, calculando saldoFinal (= saldoInicial + entradas - saídas)
async function fechar(id) {
  const caixa = await prisma.caixa.findUnique({ where: { id } });
  if (!caixa) {
    throw new Error("Caixa não encontrado");
  }
  if (caixa.dataFechamento) {
    throw new Error("Caixa já está fechado");
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

// Retorna movimentações do dia (ex.: entradas/saídas)
// Nesse exemplo, usamos apenas o próprio modelo Caixa como registro. Se quiser diferenciar entrada e saíd