// Middleware global de tratamento de erros
export default function (err, req, res, next) {
  console.error(err);

  // Se já definimos um status no controller/service, use-o; caso contrário, 500
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({ error: message });
}
