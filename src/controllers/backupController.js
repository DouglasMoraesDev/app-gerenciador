// src/controllers/backupController.js

import prisma from "../prismaClient.js";
import path from "path";
import fs from "fs/promises";

/**
 * GET /api/backup
 * Exporta todos os dados do banco e gera um arquivo JavaScript para download.
 * O arquivo contém: module.exports = { clientes: [...], servicos: [...], ... }.
 */
export async function exportBackup(req, res) {
  try {
    // 1) Buscar todos os registros de cada tabela
    const clientes = await prisma.cliente.findMany();
    const servicos = await prisma.servico.findMany();
    const ordensServico = await prisma.ordemServico.findMany();
    const usuarios = await prisma.usuario.findMany();
    const caixa = await prisma.caixa.findMany();
    const caixaMov = await prisma.caixaMov.findMany();
    const gastos = await prisma.gasto.findMany();
    const empresasParceiras = await prisma.empresaParceira.findMany();

    // 2) Montar um objeto contendo todas as coleções
    const backupObj = {
      clientes,
      servicos,
      ordensServico,
      usuarios,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    };

    // 3) Serializar em texto JS
    const jsContent = 
      "// Este arquivo é um backup completo dos dados do Lava-Rápido Manager\n" +
      "module.exports = " +
      JSON.stringify(backupObj, null, 2) +
      ";\n";

    // 4) Definir nome do arquivo de download
    const agora = new Date();
    const timestamp = `${agora.getFullYear()}${String(agora.getMonth()+1).padStart(2,"0")}${String(agora.getDate()).padStart(2,"0")}_` +
                      `${String(agora.getHours()).padStart(2,"0")}${String(agora.getMinutes()).padStart(2,"0")}`;
    const filename = `backup_${timestamp}.js`;

    // 5) Enviar como anexo
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(jsContent);
  } catch (err) {
    console.error("Erro em exportBackup:", err);
    return res.status(500).json({ error: "Erro interno ao gerar backup." });
  }
}

/**
 * POST /api/backup/restore
 * Recebe um arquivo .js (módulo que exporta um objeto), faz eval
 * para resgatar os dados e re-popula o banco (apagando tudo antes).
 */
export async function restoreBackup(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo de backup não enviado." });
    }

    // 1) Ler o conteúdo do arquivo enviado
    const filePath = req.file.path; // caminho temporário onde multer salvou
    const content = await fs.readFile(filePath, "utf-8");

    // 2) Fazer eval do conteúdo ‒ deve conter `module.exports = { ... }`
    //    Para segurança, envolvemos em função anônima.
    let backupData;
    try {
      const wrapper = `(function() { ${content} return module.exports; })()`;
      backupData = eval(wrapper);
    } catch (evalErr) {
      console.error("Erro ao avaliar arquivo de backup:", evalErr);
      return res.status(400).json({ error: "Arquivo de backup inválido ou corrompido." });
    }

    // 3) Validar formato de backupData (deve conter as chaves usadas no export)
    const {
      clientes,
      servicos,
      ordensServico,
      usuarios,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    } = backupData;

    if (!clientes || !servicos || !ordensServico || !usuarios ||
        !caixa || !caixaMov || !gastos || !empresasParceiras) {
      return res.status(400).json({ error: "Formato de backup incompleto." });
    }

    // 4) Limpar todas as tabelas (ordem inversa às dependências)
    //    Atenção: ordensServico referencia clientes, servicos e empresasParceiras
    //    caixaMov referencia ordensServico e gastos, etc.
    await prisma.caixaMov.deleteMany({});
    await prisma.caixa.deleteMany({});
    await prisma.ordemServico.deleteMany({});
    await prisma.gasto.deleteMany({});
    await prisma.empresaParceira.deleteMany({});
    await prisma.servico.deleteMany({});
    await prisma.cliente.deleteMany({});
    await prisma.usuario.deleteMany({});

    // 5) Inserir novamente todos os registros, mantendo os IDs originais
    //    Para manter IDs, usamos createMany({ data: ..., skipDuplicates: true })
    //    Porém, createMany não garante inserção de ID custom. Então usamos create() em loop.

    // Usuários
    for (const u of usuarios) {
      const { id, nome, email, senha, papel, criadoEm, ...rest } = u;
      await prisma.usuario.create({
        data: { id, nome, email, senha, papel, criadoEm },
      });
    }

    // Clientes
    for (const c of clientes) {
      const { id, nome, telefone, email: emailCli, veiculo, placa, criadoEm } = c;
      await prisma.cliente.create({
        data: { id, nome, telefone, email: emailCli, veiculo, placa, criadoEm },
      });
    }

    // Serviços
    for (const s of servicos) {
      const { id, nome, descricao, valor, criadoEm } = s;
      await prisma.servico.create({
        data: { id, nome, descricao, valor, criadoEm },
      });
    }

    // Empresas Parceiras
    for (const p of empresasParceiras) {
      const { id, nome, cnpj, descricao: desc, valorMensal, contratoUrl, criadoEm } = p;
      await prisma.empresaParceira.create({
        data: { id, nome, cnpj, descricao: desc, valorMensal, contratoUrl, criadoEm },
      });
    }

    // Ordens de Serviço
    for (const o of ordensServico) {
      const {
        id, clienteId, servicoId, descricaoServico, valorServico,
        status, criadoEm, atualizadoEm, finalizadoPorId, modalidadePagamento,
        movCaixaId, parceiroId
      } = o;

      await prisma.ordemServico.create({
        data: {
          id,
          clienteId,
          servicoId,
          descricaoServico,
          valorServico,
          status,
          criadoEm,
          atualizadoEm,
          finalizadoPorId,
          modalidadePagamento,
          movCaixaId,
          parceiroId
        }
      });
    }

    // Caixa
    for (const c of caixa) {
      const { id, dataAbertura, dataFechamento, saldoInicial, saldoFinal, entradas, saidas, usuarioId } = c;
      await prisma.caixa.create({
        data: {
          id,
          dataAbertura,
          dataFechamento,
          saldoInicial,
          saldoFinal,
          entradas,
          saidas,
          usuarioId
        }
      });
    }

    // Gasto
    for (const g of gastos) {
      const { id, categoria, descricao, valor, data, usuarioId, movCaixaId } = g;
      await prisma.gasto.create({
        data: { id, categoria, descricao, valor, data, usuarioId, movCaixaId }
      });
    }

    // CaixaMov
    for (const m of caixaMov) {
      const { id, tipo, valor, createdAt, usuarioId, caixaId, ordemId, gastoId } = m;
      await prisma.caixaMov.create({
        data: {
          id,
          tipo,
          valor,
          createdAt,
          usuarioId,
          caixaId,
          ordemId,
          gastoId
        }
      });
    }

    // 6) Remover o arquivo temporário de upload
    await fs.unlink(filePath);

    return res.json({ message: "Backup restaurado com sucesso." });
  } catch (err) {
    console.error("Erro em restoreBackup:", err);
    return res.status(500).json({ error: "Erro interno ao restaurar backup." });
  }
}
