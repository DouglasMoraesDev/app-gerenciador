// src/services/osService.js

import prisma from "../prismaClient.js";

/**
 * Retorna todas as ordens de serviço,
 * incluindo os dados do cliente relacionado.
 */
async function getTodas() {
  return prisma.ordemServico.findMany({
    include: { cliente: true },
  });
}

/**
 * Retorna uma ordem de serviço pelo seu ID,
 * incluindo os dados do cliente relacionado.
 */
async function getPorId(id) {
  return prisma.ordemServico.findUnique({
    where: { id },
    include: { cliente: true },
  });
}

/**
 * Cria uma nova ordem de serviço.
 * @param {{ clienteId: number, descricao: string, valorTotal: number, status?: string }} dados
 */
async function criar(dados) {
  return prisma.ordemServico.create({
    data: {
      descricao: dados.descricao,
      status: dados.status || "PENDENTE",
      valorTotal: dados.valorTotal,
      cliente: { connect: { id: dados.clienteId } },
    },
    include: { cliente: true },
  });
}

/**
 * Atualiza uma ordem de serviço existente.
 * @param {number} id
 * @param {{ descricao: string, valorTotal: number, status: string }} dados
 */
async function atualizar(id, dados) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      descricao: dados.descricao,
      status: dados.status,
      valorTotal: dados.valorTotal,
    },
    include: { cliente: true },
  });
}

/**
 * Deleta uma ordem de serviço pelo seu ID.
 * @param {number} id
 */
async function deletar(id) {
  return prisma.ordemServico.delete({
    where: { id },
  });
}

// Export padrão contendo todos os métodos
export default {
  getTodas,
  getPorId,
  criar,
  atualizar,
  deletar,
};
