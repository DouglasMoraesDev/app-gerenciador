import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// … função login já existente …

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    // 1) Verifica se já existe usuário com esse e-mail
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // 2) Gera hash da senha
    const hash = await bcrypt.hash(senha, 10);

    // 3) Cria o usuário no banco (papel padrão “OPERADOR”)
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
        papel: "OPERADOR",
      },
    });

    // 4) Retorna dados básicos (sem a senha)
    return res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      papel: novoUsuario.papel,
    });
  } catch (err) {
    next(err);
  }
}
