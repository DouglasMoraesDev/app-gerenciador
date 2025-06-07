import prisma from "../prismaClient.js";
import { ModalidadePagamento, StatusOS } from "@prisma/client";

/**
 * Retorna todas as ordens de serviço (do dia ou gerais), incluindo dados de carro, serviço, usuário que finalizou e parceiro (se houver).
 */
async function getTodas() {
  return prisma.ordemServico.findMany({
    include: {
      carro:        true,
      servico:      true,
      finalizadoPor:true,
      parceiro:     true    // incluir dados de parceiro (pode ser null)
    }
  });
}

/**
 * Retorna uma OS pelo ID, com carro, serviço, quem finalizou e parceiro (se houver).
 */
async function getPorId(id) {
  return prisma.ordemServico.findUnique({
    where: { id },
    include: {
      carro:        true,
      servico:      true,
      finalizadoPor:true,
      parceiro:     true
    }
  });
}

/**
 * Cria uma nova OS, conectando ao carro, serviço e (opcionalmente) parceiro.
 * Se o front enviar um “valorServico” customizado, usa ele; senão, pega o valor do serviço.
 * Se enviar “parceiroId”, conecta a OS a essa empresa parceira. Caso contrário, parceiro permanece null.
 */
async function criar(dados) {
  // Busca o serviço para copiar descrição e valor padrão
  const servico = await prisma.servico.findUnique({ where: { id: dados.servicoId } });
  if (!servico) {
    throw Object.assign(new Error("Serviço não encontrado."), { status: 404 });
  }

  // Se o front passou valorServico (tipo number), usa esse valor; senão, usa servico.valor
  const valorFinal = typeof dados.valorServico === "number"
    ? dados.valorServico
    : servico.valor;

  return prisma.ordemServico.create({
    data: {
      carro:            { connect: { id: dados.carroId } },
      servico:          { connect: { id: dados.servicoId } },
      descricaoServico: servico.descricao,
      valorServico:     valorFinal,
      status:           StatusOS.PENDENTE,
      // Conecta a OS a uma empresa parceira, se foi passado parceiroId. Caso contrário, não inclui esse campo.
      ...(dados.parceiroId
        ? { parceiro: { connect: { id: dados.parceiroId } } }
        : {})
    },
    include: {
      carro:    true,
      servico:  true,
      parceiro: true   // já traz os dados da empresa parceira no retorno
    }
  });
}

/**
 * Atualiza apenas campos básicos de uma OS (EXCETO finalização/pagamento). 
 * Caso queira atualizar descrição/valor, basta descomentar as linhas abaixo.
 */
async function atualizar(id, dados) {
  return prisma.ordemServico.update({
    where: { id },
    data: {
      status: dados.status,
      // Se quiser permitir edição de descrição/valor, descomente:
      // descricaoServico: dados.descricaoServico,
      // valorServico:     dados.valorServico,
      // Se quiser editar parceiro:
      // parceiroId: dados.parceiroId ? Number(dados.parceiroId) : null,
    },
    include: {
      carro:        true,
      servico:      true,
      finalizadoPor:true,
      parceiro:     true
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
 * Atualiza apenas o status de uma OS. 
 * - Se status != ENTREGUE, apenas altera o campo status/modality sem tocar no caixa.
 * - Se status === ENTREGUE, registra entrada no caixa aberto (se houver) e conecta a movimentação.
 */
async function patchStatus(id, status, modalidadePagamento, usuarioId) {
  // 1) Valida se “status” faz parte do enum StatusOS
  if (!Object.values(StatusOS).includes(status)) {
    throw Object.assign(new Error("Status inválido."), { status: 400 });
  }

  // 2) Atualiza o status / modalidade / quem finalizou
  const osAtualizada = await prisma.ordemServico.update({
    where: { id },
    data: {
      status,
      modalidadePagamento: status === StatusOS.ENTREGUE ? modalidadePagamento : null,
      finalizadoPor:       status === StatusOS.ENTREGUE ? { connect: { id: usuarioId } } : undefined,
    },
    include: {
      carro:        true,
      servico:      true,
      finalizadoPor:true,
      movCaixa:     true,
      parceiro:     true
    },
  });

  // 3) Se for para ENTREGUE, precisa registrar entrada no caixa aberto
  if (status === StatusOS.ENTREGUE) {
    // Busca o caixa aberto (dataFechamento == null)
    const caixa = await prisma.caixa.findFirst({ where: { dataFechamento: null } });
    if (!caixa) {
      // *** se não houver caixa aberto, lança erro 400 ***
      throw Object.assign(new Error("Nenhum caixa aberto para registrar entrada."), { status: 400 });
    }

    // Cria movimentação de entrada no caixa
    const mov = await prisma.caixaMov.create({
      data: {
        tipo: "ENTRADA",
        valor: osAtualizada.valorServico,
        usuario: { connect: { id: usuarioId } },
        caixa:   { connect: { id: caixa.id } },
        ordem:   { connect: { id } },
      },
    });

    // Incrementa o total de "entradas" no próprio caixa
    await prisma.caixa.update({
      where: { id: caixa.id },
      data: { entradas: { increment: osAtualizada.valorServico } }
    });

    // Conecta a movimentação de caixa à própria OS
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
