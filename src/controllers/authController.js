import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validarEmail } from "../utils/validators.js";

// Controller de login e registro de usuários

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token com id, email, nome e papel
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres." });
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
        papel: "OPERADOR",
      },
    });

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
