// src/services/auditoriaService.js

import prisma from "../prismaClient.js";

/**
 * Retorna todas as movimentações (caixaMov) entre duas datas,
 * e também o saldoInicial do caixa no começo desse intervalo.
 *
 * @param {string} start — "YYYY-MM-DD"
 * @param {string} end   — "YYYY-MM-DD"
 * @returns {Promise<{ saldoInicial: number, movimentacoes: Array }>}
 */
export async function getMovimentosRange(start, end) {
  const dtStart = new Date(start);
  const dtEnd   = new Date(end);
  dtEnd.setHours(23, 59, 59, 999);

  // 1) Movimentações no intervalo
  const movimentacoes = await prisma.caixaMov.findMany({
    where: { createdAt: { gte: dtStart, lte: dtEnd } },
    include: {
      usuario: true,
      ordem:   { select: { id: true, descricaoServico: true } },
      gasto:   { select: { descricao: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  // 2) Saldo inicial: busca o caixa cuja dataAbertura é 
  //    <= dtStart, pegando o mais recente antes ou em dtStart
  const caixaInicial = await prisma.caixa.findFirst({
    where: { dataAbertura: { lte: dtStart } },
    orderBy: { dataAbertura: "desc" }
  });

  const saldoInicial = caixaInicial?.saldoInicial || 0;

  return { saldoInicial, movimentacoes };
}
