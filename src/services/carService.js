import prisma from "../prismaClient.js";

export const getTodosCarros = async () => {
  return prisma.carro.findMany({
    orderBy: { criadoEm: "desc" }
  });
};

export const getCarroPorId = async (id) => {
  return prisma.carro.findUnique({
    where: { id: Number(id) }
  });
};

export const criarCarro = async ({ proprietario, telefone, email, modelo, placa }) => {
  return prisma.carro.create({
    data: {
      proprietario,
      telefone: telefone || null,
      email:    email || null,
      modelo:   modelo || null,
      placa
    }
  });
};

export const atualizarCarro = async (id, data) => {
  return prisma.carro.update({
    where: { id: Number(id) },
    data
  });
};

export const deletarCarro = async (id) => {
  return prisma.carro.delete({
    where: { id: Number(id) }
  });
};
