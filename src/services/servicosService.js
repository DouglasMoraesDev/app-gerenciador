import prisma from "../prismaClient.js";

async function getTodos() {
  return prisma.servico.findMany();
}

async function getPorId(id) {
  return prisma.servico.findUnique({ where: { id } });
}

async function criar(dados) {
  return prisma.servico.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      valor: dados.valor
    }
  });
}

async function atualizar(id, dados) {
  return prisma.servico.update({
    where: { id },
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      valor: dados.valor
    }
  });
}

async function deletar(id) {
  return prisma.servico.delete({ where: { id } });
}

export default {
  getTodos,
  getPorId,
  criar,
  atualizar,
  deletar
};
