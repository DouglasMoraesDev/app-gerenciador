import prisma from "../prismaClient.js";

export const getTodasParceiras = async () => {
  return await prisma.empresaParceira.findMany({ orderBy: { criadoEm: 'desc' } });
};

export const getParceiraPorId = async (id) => {
  return await prisma.empresaParceira.findUnique({ where: { id: Number(id) } });
};

export const criarParceira = async (data) => {
  return await prisma.empresaParceira.create({ data });
};

export const atualizarParceira = async (id, data) => {
  return await prisma.empresaParceira.update({
    where: { id: Number(id) },
    data
  });
};

export const deletarParceira = async (id) => {
  return await prisma.empresaParceira.delete({ where: { id: Number(id) } });
};
