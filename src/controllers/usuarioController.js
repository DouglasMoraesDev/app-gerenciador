// src/controllers/usuarioController.js

import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";

/**
 * GET /api/usuario/me
 * Retorna os dados do usuário autenticado (id, nome, email).
 */
export async function getUsuarioMe(req, res) {
  try {
    // Agora pegamos o id em req.usuario.id (conforme o middleware)
    const usuarioId = req.usuario.id;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(usuario);
  } catch (err) {
    console.error("Erro em getUsuarioMe:", err);
    return res.status(500).json({ error: "Erro interno ao buscar dados do usuário." });
  }
}

/**
 * PUT /api/usuario/update
 * Body: { nome: "Novo Nome" }
 * Atualiza o nome do usuário autenticado.
 */
export async function updateUsuarioNome(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { nome } = req.body;

    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ error: "O nome não pode ficar em branco." });
    }

    const atualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { nome: nome.trim() },
      select: { id: true, nome: true, email: true }
    });

    return res.json(atualizado);
  } catch (err) {
    console.error("Erro em updateUsuarioNome:", err);
    return res.status(500).json({ error: "Erro interno ao atualizar nome." });
  }
}

/**
 * PATCH /api/usuario/change-password
 * Body: { senhaAntiga: "abc", novaSenha: "xyz" }
 * Valida a senha antiga, e se correta, hash e atualiza a nova senha.
 */
export async function changePassword(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { senhaAntiga, novaSenha } = req.body;

    if (!senhaAntiga || !novaSenha) {
      return res.status(400).json({ error: "É necessário fornecer senha atual e nova senha." });
    }

    // Busca o hash atual no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { senha: true }
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Compara senha antiga
    const senhaConfere = await bcrypt.compare(senhaAntiga, usuario.senha);
    if (!senhaConfere) {
      return res.status(400).json({ error: "A senha atual está incorreta." });
    }

    // Faz hash da nova senha e salva
    const saltRounds = 10;
    const novoHash = await bcrypt.hash(novaSenha, saltRounds);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: novoHash }
    });

    return res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    console.error("Erro em changePassword:", err);
    return res.status(500).json({ error: "Erro interno ao alterar senha." });
  }
}
