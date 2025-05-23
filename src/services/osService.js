import prisma from "../prismaClient.js";

async function getTodos() {
  return prisma.ordemServico.findMany({
    include: { cliente: true }
  });
}

async function criar(data) {
  return prisma.ordemServico.create({
    data: {
      clienteId: data.clienteId,
      descricao: data.descricao,
      status: data.status || "PENDENTE",
      valorTotal: data.valorTotal
    }
  });
}

async function atualizar(id, data) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      descricao: data.descricao,
      status: data.status,
      valorTotal: data.valorTotal
    }
  });
}

async function deletar(id) {
  return prisma.ordemServico.delete({
    where: { id }
  });
}

export default {
  getTodas,
  getPorId,
  criar,
  atualizar,
  deletar
};
