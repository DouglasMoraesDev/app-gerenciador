import jwt from "jsonwebtoken";

// Middleware para proteger rotas
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autorizado: token ausente" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Injetar dados do usuário autenticado em req.usuario
    req.usuario = {
      id: payload.id,
      email: payload.email,
      nome: payload.nome,
      papel: payload.papel
    };
    next();
  } catch (err) {
    // Se o token estiver expirado ou inválido
    return res.status(401).json({ error: "Não autorizado: token inválido" });
  }
}
