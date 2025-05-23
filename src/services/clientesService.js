import prisma from "../prismaClient.js";

async function getTodos() {
  return prisma.cliente.findMany();
}

async function getPorId(id) {
  return prisma.cliente.findUnique({ where: { id } });
}

async function criar(dados) {
  return prisma.cliente.create({
    data: {
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
      veiculo: dados.veiculo,
      placa: dados.placa
    }
  });
}

async function atualizar(id, dados) {
  return prisma.cliente.update({
    where: { id },
    data: {
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
      veiculo: dados.veiculo,
      placa: dados.placa
    }
  });
}

async function deletar(id) {
  return prisma.cliente.delete({ where: { id } });
}

export default {
  getTodos,
  getPorId,
  criar,
  atualizar,
  deletar
};
