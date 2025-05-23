import prisma from "../prismaClient.js";

async function getTodas() {
  return prisma.ordemServico.findMany({
    include: { cliente: true }
  });
}

async function getPorId(id) {
  return prisma.ordemServico.findUnique({
    where: { id },
    include: { cliente: true }
  });
}

async function criar(dados) {
  return prisma.ordemServico.create({
    data: {
      descricao: dados.descricao,
      status: dados.status || "PENDENTE",
      valorTotal: dados.valorTotal,
      cliente: { connect: { id: dados.clienteId } }
    },
    include: { cliente: true }
  });
}

async function atualizar(id, dados) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      descricao: dados.descricao,
      status: dados.status,
      valorTotal: dados.valorTotal
    },
    include: { cliente: true }
  });
}

async function deletar(id) {
  return prisma.ordemServico.delete({ where: { id } });
}

export default {
  getTodas,
  getPorId,
  criar,
  atualizar,
  deletar
};