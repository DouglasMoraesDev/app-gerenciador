// src/controllers/backupController.js

import prisma from "../prismaClient.js";
import fs from "fs/promises";

/**
 * GET /api/backup
 * Exporta todos os dados do banco em um JSON para download.
 */
export async function exportBackup(req, res, next) {
  try {
    // 1) Buscar todos os registros de cada tabela que existem no seu schema
    const usuarios          = await prisma.usuario.findMany();
    const servicos          = await prisma.servico.findMany();
    const itensOrdemServico  = await prisma.ordemServicoItem.findMany();
    const ordensServico     = await prisma.ordemServico.findMany();
    const caixa             = await prisma.caixa.findMany();
    const caixaMov          = await prisma.caixaMov.findMany();
    const gastos            = await prisma.gasto.findMany();
    const empresasParceiras = await prisma.empresaParceira.findMany();

    // 2) Montar o objeto de backup
    const backupData = {
      geradoEm: new Date().toISOString(),
      usuarios,
      servicos,
      itensOrdemServico,
      ordensServico,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    };

    // 3) Serializar como texto JSON
    const jsonContent = JSON.stringify(backupData, null, 2);

    // 4) Definir nome do arquivo
    const now = new Date();
    const ts  = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_` +
                `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
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
 * Recebe um JSON no formato de exportBackup e re-popula o banco.
 * Atenção: requer multer para 'backupFile'.
 */
export async function restoreBackup(req, res, next) {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ error: "Arquivo de backup não enviado." });
    }

    // 1) Ler e parsear o JSON
    const raw = await fs.readFile(req.file.path, "utf-8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error("JSON inválido no backup:", parseErr);
      return res.status(400).json({ error: "Formato de backup inválido." });
    }

    const {
      usuarios,
      servicos,
      itensOrdemServico,
      ordensServico,
      caixa,
      caixaMov,
      gastos,
      empresasParceiras
    } = data;

    // 2) Validação mínima
    if (!usuarios || !servicos || !itensOrdemServico || !ordensServico ||
        !caixa    || !caixaMov   || !gastos             || !empresasParceiras) {
      return res.status(400).json({ error: "Backup incompleto." });
    }

    // 3) Limpar tabelas (inverter ordem de dependência)
    await prisma.caixaMov.deleteMany();
    await prisma.gasto.deleteMany();
    await prisma.caixa.deleteMany();
    await prisma.ordemServico.deleteMany();
    await prisma.ordemServicoItem.deleteMany();
    await prisma.empresaParceira.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.usuario.deleteMany();

    // 4) Restaurar registros (mantendo IDs originais)
    for (const u of usuarios)           await prisma.usuario.create({ data: u });
    for (const s of servicos)           await prisma.servico.create({ data: s });
    for (const i of itensOrdemServico)  await prisma.ordemServicoItem.create({ data: i });
    for (const o of ordensServico)      await prisma.ordemServico.create({ data: o });
    for (const c of caixa)              await prisma.caixa.create({ data: c });
    for (const g of gastos)             await prisma.gasto.create({ data: g });
    for (const m of caixaMov)           await prisma.caixaMov.create({ data: m });
    for (const p of empresasParceiras)  await prisma.empresaParceira.create({ data: p });

    // 5) Apagar o arquivo temporário
    await fs.unlink(req.file.path);

    return res.json({ message: "Backup restaurado com sucesso." });
  } catch (err) {
    console.error("Erro em restoreBackup:", err);
    return res.status(500).json({ error: "Erro interno ao restaurar backup." });
  }
}
