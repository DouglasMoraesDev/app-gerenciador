// src/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import prisma from "./prismaClient.js";
import authRoutes     from "./routes/authRoutes.js";
import carRoutes      from "./routes/carRoutes.js";        // Nova rota de carros
import servicosRoutes from "./routes/servicosRoutes.js";
import osRoutes       from "./routes/osRoutes.js";
import caixaRoutes    from "./routes/caixaRoutes.js";
import gastosRoutes   from "./routes/gastosRoutes.js";
import auditoriaRoutes from "./routes/auditoriaRoutes.js";
import parceriaRoutes  from "./routes/parceiraRoutes.js";
import usuarioRoutes   from "./routes/usuarioRoutes.js";
import backupRoutes    from "./routes/backupRoutes.js";

import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();
const app = express();

// -------------------------------
// Lista de origens permitidas para CORS
// -------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://app-gerenciador-production.up.railway.app"
];

// Configura CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Bloqueado pelo CORS"));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// Preflight (configuração opcional, mas garante que OPTIONS será atendido)
app.options("*", cors());

// Body parser para JSON em todas as rotas
app.use(express.json());

// -------------------------------
// Endereço de health-check para monitoramento
// -------------------------------
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "conectado" });
  } catch {
    res.status(500).json({ status: "erro", db: "não conectado" });
  }
});

// -------------------------------
// Servir arquivos estáticos do frontend
// -------------------------------
app.use(express.static(path.join(process.cwd(), "public/html")));
app.use("/css", express.static(path.join(process.cwd(), "public/css")));
app.use("/js",  express.static(path.join(process.cwd(), "public/js")));

// Expor a pasta de uploads (contratos de parceiras, etc.)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// -------------------------------
// Rotas da API
// -------------------------------

// Rotas de Autenticação (login / register)
app.use("/api/auth", authRoutes);

// ***********************************************
// Substituímos "/api/clientes" por "/api/carros" *
// ***********************************************
app.use("/api/carros", carRoutes);

// Rotas de Serviços
app.use("/api/servicos", servicosRoutes);

// Rotas de Ordens de Serviço
app.use("/api/os", osRoutes);

// Rotas de Caixa (abertura, fechamento, movimentações)
app.use("/api/caixa", caixaRoutes);

// Rotas de Gastos
app.use("/api/gastos", gastosRoutes);

// Rotas de Auditoria (relatórios resumido e intervalo)
app.use("/api/auditoria", auditoriaRoutes);

// Rotas de Empresas Parceiras
app.use("/api/parceiras", parceriaRoutes);

// Rotas de Usuário (me, update-nome, change-password)
app.use("/api/usuario", usuarioRoutes);

// Rotas de Backup (exportar / restaurar)
app.use("/api/backup", backupRoutes);

// -------------------------------
// Middleware global de tratamento de erros
// -------------------------------
app.use(errorHandler);

// -------------------------------
// Iniciar servidor na porta configurada
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
