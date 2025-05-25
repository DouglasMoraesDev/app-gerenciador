// src/services/osService.js

import prisma from "../prismaClient.js";
import { ModalidadePagamento, StatusOS } from "@prisma/client";

/**
 * Retorna todas as ordens de serviço,
 * incluindo dados de cliente, serviço e parceiro (se houver).
 */
async function getTodas() {
  return prisma.ordemServico.findMany({
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true,
      parceiro: true, // inclui dados da empresa parceira
    },
  });
}

/**
 * Retorna uma OS pelo ID, com cliente, serviço e parceiro.
 */
async function getPorId(id) {
  return prisma.ordemServico.findUnique({
    where: { id },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true,
      parceiro: true, // inclui dados da empresa parceira
    },
  });
}

/**
 * Cria uma nova OS, copiando descrição e valor do serviço.
 * Agora também aceita parceiroId (opcional) para associar à empresa parceira.
 */
async function criar(dados) {
  // Fetch do serviço para copiar descrição e valor
  const servico = await prisma.servico.findUnique({ where: { id: dados.servicoId } });
  if (!servico) {
    throw Object.assign(new Error("Serviço não encontrado."), { status: 404 });
  }

  // Monta o objeto "data" para criar a OS, incluindo parceiro se fornecido
  const dataCriacao = {
    cliente: { connect: { id: dados.clienteId } },
    servico: { connect: { id: dados.servicoId } },
    descricaoServico: servico.descricao,
    valorServico: servico.valor,
    status: StatusOS.PENDENTE,
  };

  // Se vier parceiroId válido, conecta a empresa parceira
  if (dados.parceiroId) {
    dataCriacao.parceiro = { connect: { id: Number(dados.parceiroId) } };
  }

  return prisma.ordemServico.create({
    data: dataCriacao,
    include: {
      cliente: true,
      servico: true,
      parceiro: true, // retorna dados da empresa parceira
    },
  });
}

/**
 * Atualiza OS (exceto finalização/pagamento). Manter lógica anterior.
 */
async function atualizar(id, dados) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      status: dados.status,
      // se quiser permitir editar descrição/valor, descomente:
      // descricaoServico: dados.descricaoServico,
      // valorServico: dados.valorServico,
      // permitir editar parceiro se necessário:
      // parceiroId: dados.parceiroId ? Number(dados.parceiroId) : null,
    },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true,
      parceiro: true,
    },
  });
}

/**
 * Deleta uma OS pelo ID.
 */
async function deletar(id) {
  return prisma.ordemServico.delete({ where: { id } });
}

/**
 * Atualiza apenas o status e registra finalização no caixa.
 */
async function patchStatus(id, status, modalidadePagamento, usuarioId) {
  if (!Object.values(StatusOS).includes(status)) {
    throw Object.assign(new Error("Status inválido."), { status: 400 });
  }

  const osAtualizada = await prisma.ordemServico.update({
    where: { id },
    data: {
      status,
      modalidadePagamento: status === StatusOS.ENTREGUE ? modalidadePagamento : null,
      finalizadoPor: status === StatusOS.ENTREGUE ? { connect: { id: usuarioId } } : undefined,
    },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true,
      movCaixa: true,
      parceiro: true, // inclui parceiro no retorno
    },
  });

  if (status === StatusOS.ENTREGUE) {
    const caixa = await prisma.caixa.findFirst({ where: { dataFechamento: null } });
    if (!caixa) {
      throw Object.assign(new Error("Nenhum caixa aberto para registrar entrada."), { status: 400 });
    }
    const mov = await prisma.caixaMov.create({
      data: {
        tipo: "ENTRADA",
        valor: osAtualizada.valorServico,
        usuario: { connect: { id: usuarioId } },
        caixa: { connect: { id: caixa.id } },
        ordem: { connect: { id } },
      },
    });
    await prisma.caixa.update({
      where: { id: caixa.id },
      data: { entradas: { increment: osAtualizada.valorServico } },
    });
    await prisma.ordemServico.update({
      where: { id },
      data: { movCaixa: { connect: { id: mov.id } } },
    });
  }

  return osAtualizada;
}

export default {
  getTodas,
  getPorId,
  criar,
  atualizar,
  deletar,
  patchStatus,
};
