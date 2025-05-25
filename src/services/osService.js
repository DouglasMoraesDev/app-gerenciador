import prisma from "../prismaClient.js";
import { ModalidadePagamento, StatusOS } from "@prisma/client";

/**
 * Retorna todas as ordens de serviço,
 * incluindo dados de cliente e serviço.
 */
async function getTodas() {
  return prisma.ordemServico.findMany({
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true
    }
  });
}

/**
 * Retorna uma OS pelo ID, com cliente e serviço.
 */
async function getPorId(id) {
  return prisma.ordemServico.findUnique({
    where: { id },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true
    }
  });
}

/**
 * Cria uma nova OS, copiando descrição e valor do serviço.
 */
async function criar(dados) {
  // Fetch do serviço para copiar descrição e valor
  const servico = await prisma.servico.findUnique({ where: { id: dados.servicoId } });
  if (!servico) {
    throw Object.assign(new Error("Serviço não encontrado."), { status: 404 });
  }

  return prisma.ordemServico.create({
    data: {
      cliente: { connect: { id: dados.clienteId } },
      servico: { connect: { id: dados.servicoId } },
      descricaoServico: servico.descricao,
      valorServico: servico.valor,
      status: StatusOS.PENDENTE
    },
    include: {
      cliente: true,
      servico: true
    }
  });
}

/**
 * Atualiza OS (exceto finalização/pagamento).
 */
async function atualizar(id, dados) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      // Caso queira permitir alterar somente descrição/valor, descomente e ajuste:
      // descricaoServico: dados.descricaoServico,
      // valorServico: dados.valorServico
      status: dados.status
    },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true
    }
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
 * Se status == ENTREGUE, registra movimentação de entrada no caixa.
 */
async function patchStatus(id, status, modalidadePagamento, usuarioId) {
  // Validar status
  if (!Object.values(StatusOS).includes(status)) {
    throw Object.assign(new Error("Status inválido."), { status: 400 });
  }

  // Atualizar status e setar pagamento caso ENTREGUE
  const osAtualizada = await prisma.ordemServico.update({
    where: { id },
    data: {
      status,
      modalidadePagamento: status === StatusOS.ENTREGUE ? modalidadePagamento : null,
      finalizadoPor: status === StatusOS.ENTREGUE ? { connect: { id: usuarioId } } : undefined
    },
    include: {
      cliente: true,
      servico: true,
      finalizadoPor: true,
      movCaixa: true
    }
  });

  // Se foi entregue, registrar entrada no caixa
  if (status === StatusOS.ENTREGUE) {
    // Obter caixa aberto
    const caixa = await prisma.caixa.findFirst({ where: { dataFechamento: null } });
    if (!caixa) {
      throw Object.assign(new Error("Nenhum caixa aberto para registrar entrada."), { status: 400 });
    }
    // Registrar movimentação no caixa
    const mov = await prisma.caixaMov.create({
      data: {
        tipo: "ENTRADA",
        valor: osAtualizada.valorServico,
        usuario: { connect: { id: usuarioId } },
        caixa: { connect: { id: caixa.id } },
        ordem: { connect: { id } }
      }
    });
    // Atualizar soma de entradas no caixa
    await prisma.caixa.update({
      where: { id: caixa.id },
      data: {
        entradas: { increment: osAtualizada.valorServico }
      }
    });
    // Vincular movCaixa na OS (caso necessário)
    await prisma.ordemServico.update({
      where: { id },
      data: { movCaixa: { connect: { id: mov.id } } }
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
  patchStatus
};
