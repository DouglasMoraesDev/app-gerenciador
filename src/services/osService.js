// src/services/osService.js

import { PrismaClient } from "@prisma/client";
import { parseBRL } from "../../public/js/utils/format.js";

const prisma = new PrismaClient();

const osService = {
  async getTodas() {
    return prisma.ordemServico.findMany({
      include: {
        itens:        { include: { servico: true } },
        finalizadoPor:true,
        parceiro:     true
      },
      orderBy: { criadoEm: "desc" }
    });
  },

  async getPorId(id) {
    return prisma.ordemServico.findUnique({
      where: { id: Number(id) },
      include: {
        itens:        { include: { servico: true } },
        finalizadoPor:true,
        parceiro:     true
      }
    });
  },

  async criar({ plate, model, parceiroId, itens }) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw Object.assign(new Error("Informe ao menos um serviço."), { status: 400 });
    }

    // Copiar descrição do primeiro serviço para descrição da OS
    const servPrimeiro = await prisma.servico.findUnique({
      where: { id: Number(itens[0].servicoId) }
    });
    if (!servPrimeiro) {
      throw Object.assign(new Error("Serviço não encontrado."), { status: 404 });
    }

    // Soma total de todos os itens para valorServico da OS
    const totalValor = itens.reduce((sum, i) => {
      const v = typeof i.valorServico === "number"
        ? i.valorServico
        : parseBRL(i.valorServico);
      return sum + v;
    }, 0);

    return prisma.ordemServico.create({
      data: {
        placa:            plate,
        modelo:           model,
        descricaoServico: servPrimeiro.descricao,
        valorServico:     totalValor,
        status:           "PENDENTE",
        ...(parceiroId
          ? { parceiro: { connect: { id: Number(parceiroId) } } }
          : {}),
        itens: {
          create: itens.map(i => ({
            servico:      { connect: { id: Number(i.servicoId) } },
            valorServico: typeof i.valorServico === "number"
                              ? i.valorServico
                              : parseBRL(i.valorServico),
            // removido modalidadePagamento aqui
          }))
        }
      },
      include: {
        itens:    { include: { servico: true } },
        parceiro: true
      }
    });
  },

  async atualizar(id, dados) {
    return prisma.ordemServico.update({
      where: { id: Number(id) },
      data: {
        status: dados.status,
        parceiro: dados.parceiroId
          ? { connect: { id: Number(dados.parceiroId) } }
          : { disconnect: true }
      },
      include: {
        itens:        { include: { servico: true } },
        finalizadoPor:true,
        parceiro:     true
      }
    });
  },

  async deletar(id) {
    return prisma.ordemServico.delete({ where: { id: Number(id) } });
  },

  async patchStatus(id, status, modalidadePagamento, usuarioId) {
    const statuses = ["PENDENTE","EM_ANDAMENTO","PRONTO","ENTREGUE"];
    if (!statuses.includes(status)) {
      throw Object.assign(new Error("Status inválido."), { status: 400 });
    }

    const os = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: {
        status,
        modalidadePagamento: status === "ENTREGUE" ? modalidadePagamento : null,
        finalizadoPor: status === "ENTREGUE"
                       ? { connect: { id: usuarioId } }
                       : undefined
      },
      include: {
        itens:        { include: { servico: true } },
        movCaixa:     true,
        finalizadoPor:true,
        parceiro:     true
      }
    });

    if (status === "ENTREGUE") {
      const caixa = await prisma.caixa.findFirst({ where: { dataFechamento: null } });
      if (!caixa) throw Object.assign(new Error("Nenhum caixa aberto."), { status: 400 });
      const total = os.itens.reduce((sum, i) => sum + i.valorServico, 0);
      const mov = await prisma.caixaMov.create({
        data: {
          tipo:    "ENTRADA",
          valor:   total,
          usuario: { connect: { id: usuarioId } },
          caixa:   { connect: { id: caixa.id } },
          ordem:   { connect: { id: Number(id) } }
        }
      });
      await prisma.caixa.update({
        where: { id: caixa.id },
        data: { entradas: { increment: total } }
      });
      await prisma.ordemServico.update({
        where: { id: Number(id) },
        data: { movCaixa: { connect: { id: mov.id } } }
      });
    }

    return os;
  }
};

export default osService;
