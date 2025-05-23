export function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token || token !== 'Bearer meu-token-seguro') {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  next();
}
