// src/controllers/backupController.js

import prisma from "../prismaClient.js";
import fs from "fs/promises";
import path from "path";

/**
 * GET /api/backup
 * Exporta todos os dados do banco em um JSON para download.
 */
export async function exportBackup(req, res, next) {
  try {
    // 1) Buscar todos os registros de cada tabela
    const clientes          = await prisma.cliente.findMany();
    const servicos          = await prisma.servico.findMany();
    const ordensServico     = await prisma.ordemServico.findMany();
    const usuarios          = await prisma.usuario.findMany();
    const caixa             = await prisma.caixa.findMany();
    const caixaMov          = await prisma.caixaMov.findMany();
    const gastos            = await prisma.gasto.findMany();
    const empresasParceiras = await prisma.empresaParceira.findMany();

    // 2) Montar o objeto de backup
    const backupData = {
      geradoEm: new Date().toISOString(),
      clientes,
      servicos,
      ordensServico,
      usuarios,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    };

    // 3) Serializar como texto JSON
    const jsonContent = JSON.stringify(backupData, null, 2);

    // 4) Definir nome do arquivo
    const now = new Date();
    const ts  = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_` +
                `${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
    const filename = `backup_${ts}.json`;

    // 5) Enviar como anexo
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(jsonContent);

  } catch (err) {
    console.error("Erro em exportBackup:", err);
    return res.status(500).json({ error: "Erro interno ao gerar backup." });
  }
}

/**
 * POST /api/backup/restore
 * Recebe um arquivo JSON com o formato de exportBackup e re-popula o banco.
 * Atenção: requer que você esteja usando o middleware multer para 'backupFile'.
 */
export async function restoreBackup(req, res, next) {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "Arquivo de backup não enviado." });
    }

    const filePath = req.file.path;
    const raw      = await fs.readFile(filePath, "utf-8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error("JSON inválido no backup:", parseErr);
      return res.status(400).json({ error: "Formato de backup inválido." });
    }

    const {
      clientes,
      servicos,
      ordensServico,
      usuarios,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    } = data;

    // Validação mínima
    if (!clientes || !servicos || !ordensServico || !usuarios ||
        !caixa    || !caixaMov   || !gastos        || !empresasParceiras) {
      return res.status(400).json({ error: "Backup incompleto." });
    }

    // 1) Limpar tabelas (na ordem inversa às dependências)
    await prisma.caixaMov.deleteMany();
    await prisma.gasto.deleteMany();
    await prisma.caixa.deleteMany();
    await prisma.ordemServico.deleteMany();
    await prisma.empresaParceira.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.usuario.deleteMany();

    // 2) Restaurar registros (mantendo IDs originais)
    // Usuários
    for (const u of usuarios) {
      await prisma.usuario.create({ data: u });
    }
    // Clientes
    for (const c of clientes) {
      await prisma.cliente.create({ data: c });
    }
    // Serviços
    for (const s of servicos) {
      await prisma.servico.create({ data: s });
    }
    // Empresas Parceiras
    for (const p of empresasParceiras) {
      await prisma.empresaParceira.create({ data: p });
    }
    // Ordens de Serviço
    for (const o of ordensServico) {
      await prisma.ordemServico.create({ data: o });
    }
    // Caixa
    for (const c of caixa) {
      await prisma.caixa.create({ data: c });
    }
    // Gastos
    for (const g of gastos) {
      await prisma.gasto.create({ data: g });
    }
    // Movimentações de Caixa
    for (const m of caixaMov) {
      await prisma.caixaMov.create({ data: m });
    }

    // 3) Remover arquivo de upload
    await fs.unlink(filePath);

    return res.json({ message: "Backup restaurado com sucesso." });
  } catch (err) {
    console.error("Erro em restoreBackup:", err);
    return res.status(500).json({ error: "Erro interno ao restaurar backup." });
  }
}
