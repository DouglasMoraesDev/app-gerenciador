// src/controllers/authController.js
import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
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

    // Verifica se já existe
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
