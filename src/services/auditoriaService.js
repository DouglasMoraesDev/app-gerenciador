import prisma from "../prismaClient.js";

/**
 * Gera relatório de entradas, saídas, quantidade de OS e gastos,
 * para período mensal (YYYY-MM) ou anual (YYYY).
 * período: "mes" ou "ano"
 * valor: "YYYY-MM" ou "YYYY"
 */
export async function generateReport(periodo, valor) {
  let start, end;
  if (periodo === "mes") {
    const [year, month] = valor.split("-").map(Number);
    start = new Date(year, month - 1, 1, 0, 0, 0);
    end = new Date(year, month, 1, 0, 0, 0);
  } else if (periodo === "ano") {
    const year = Number(valor);
    start = new Date(year, 0, 1, 0, 0, 0);
    end = new Date(year + 1, 0, 1, 0, 0, 0);
  } else {
    throw Object.assign(new Error("Período inválido. Use 'mes' ou 'ano'."), { status: 400 });
  }

  // Entradas agregadas
  const entradasAgg = await prisma.caixaMov.aggregate({
    _sum: { valor: true },
    where: {
      tipo: "ENTRADA",
      createdAt: { gte: start, lt: end }
    }
  });
  // Saídas agregadas
  const saidasAgg = await prisma.caixaMov.aggregate({
    _sum: { valor: true },
    where: {
      tipo: "SAIDA",
      createdAt: { gte: start, lt: end }
    }
  });
  // Contagem de OS emitidas
  const osCount = await prisma.ordemServico.count({
    where: { criadoEm: { gte: start, lt: end } }
  });
  // Contagem de gastos
  const gastosAgg = await prisma.gasto.aggregate({
    _sum: { valor: true },
    where: { data: { gte: start, lt: end } }
  });

  return {
    totalEntradas: entradasAgg._sum.valor || 0,
    totalSaidas: saidasAgg._sum.valor || 0,
    totalOS: osCount,
    totalGastos: gastosAgg._sum.valor || 0
  };
}
