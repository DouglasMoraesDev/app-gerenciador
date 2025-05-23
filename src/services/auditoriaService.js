import prisma from '../prismaClient.js';

export async function generateReport(mes) {
  const [year, month] = mes.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const entradasAgg = await prisma.caixaMovimentacao.aggregate({
    _sum: { valor: true },
    where: { tipo: 'entrada', createdAt: { gte: start, lt: end } }
  });
  const saidasAgg = await prisma.caixaMovimentacao.aggregate({
    _sum: { valor: true },
    where: { tipo: 'saida', createdAt: { gte: start, lt: end } }
  });
  const osCount = await prisma.os.count({
    where: { criadoEm: { gte: start, lt: end } }
  });

  return {
    entradas: entradasAgg._sum.valor || 0,
    saidas: saidasAgg._sum.valor || 0,
    osCount
  };
}
