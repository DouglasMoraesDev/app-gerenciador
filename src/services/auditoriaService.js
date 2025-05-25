// src/services/auditoriaService.js

import prisma from "../prismaClient.js";

/**
 * Gera relatório de entradas, saídas, quantidade de OS e gastos,
 * para período mensal (YYYY-MM) ou anual (YYYY).
 *
 * @param {"mes"|"ano"} periodo
 * @param {string} valor — "YYYY-MM" ou "YYYY"
 * @returns {{ totalEntradas:number, totalSaidas:number, totalOS:number, totalGastos:number }}
 */
export async function generateReport(periodo, valor) {
  let start, end;

  if (periodo === "mes") {
    const [year, month] = valor.split("-").map(Number);
    start = new Date(year, month - 1, 1, 0, 0, 0);
    end   = new Date(year, month,     1, 0, 0, 0);
  } else if (periodo === "ano") {
    const year = Number(valor);
    start = new Date(year, 0, 1, 0, 0, 0);
    end   = new Date(year + 1, 0, 1, 0, 0, 0);
  } else {
    throw Object.assign(
      new Error("Período inválido. Use 'mes' ou 'ano'."),
      { status: 400 }
    );
  }

  // Soma de entradas
  const entradasAgg = await prisma.caixaMov.aggregate({
    _sum: { valor: true },
    where: {
      tipo: "ENTRADA",
      createdAt: { gte: start, lt: end }
    }
  });

  // Soma de saídas
  const saidasAgg = await prisma.caixaMov.aggregate({
    _sum: { valor: true },
    where: {
      tipo: "SAIDA",
      createdAt: { gte: start, lt: end }
    }
  });

  // Total de OS criadas
  const osCount = await prisma.ordemServico.count({
    where: { criadoEm: { gte: start, lt: end } }
  });

  // Soma de gastos
  const gastosAgg = await prisma.gasto.aggregate({
    _sum: { valor: true },
    where: { data: { gte: start, lt: end } }
  });

  return {
    totalEntradas: entradasAgg._sum.valor    || 0,
    totalSaidas:   saidasAgg._sum.valor       || 0,
    totalOS:       osCount,
    totalGastos:   gastosAgg._sum.valor       || 0
  };
}

/**
 * Retorna todas as movimentações (caixaMov) entre duas datas,
 * incluindo usuário, ordem (se for entrada de OS) e gasto (se for saída).
 *
 * @param {string} start — "YYYY-MM-DD"
 * @param {string} end   — "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
export async function getMovimentosRange(start, end) {
  const dtStart = new Date(start);
  const dtEnd   = new Date(end);
  // Ajusta fim do dia para incluir as 23:59:59
  dtEnd.setHours(23, 59, 59, 999);

  return prisma.caixaMov.findMany({
    where: {
      createdAt: { gte: dtStart, lte: dtEnd }
    },
    include: {
      usuario: true,
      ordem:   { select: { id: true, descricaoServico: true } },
      gasto:   { select: { descricao: true } }
    },
    orderBy: { createdAt: "asc" }
  });
}
