import prisma from '../prismaClient.js';

export async function fetchAll() {
  return prisma.produtoEstoque.findMany();
}

export async function fetchById(id) {
  return prisma.produtoEstoque.findUnique({ where: { id } });
}

export async function create(data) {
  return prisma.produtoEstoque.create({ data });
}

export async function update(id, data) {
  return prisma.produtoEstoque.update({ where: { id }, data });
}

export async function remove(id) {
  return prisma.produtoEstoque.delete({ where: { id } });
}
