import prisma from "../prismaClient.js";

export const getTodasParceiras = async () => {
  return prisma.empresaParceira.findMany({
    orderBy: { criadoEm: "desc" }
  });
};

export const getParceiraPorId = async (id) => {
  return prisma.empresaParceira.findUnique({
    where: { id: Number(id) }
  });
};

export const criarParceira = async ({ nome, cnpj, descricao, valorMensal, contratoUrl }) => {
  return prisma.empresaParceira.create({
    data: { nome, cnpj, descricao, valorMensal, contratoUrl }
  });
};

export const atualizarParceira = async (id, data) => {
  return prisma.empresaParceira.update({
    where: { id: Number(id) },
    data
  });
};

export const deletarParceira = async (id) => {
  return prisma.empresaParceira.delete({
    where: { id: Number(id) }
  });
};
