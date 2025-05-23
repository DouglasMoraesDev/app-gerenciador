// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não autorizado: token ausente" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Você pode acessar payload.id, payload.email, payload.nome, etc.
    req.usuario = { id: payload.id, email: payload.email, nome: payload.nome };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Não autorizado: token inválido" });
  }
}
