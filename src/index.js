import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import prisma from "./prismaClient.js";
import authRoutes from "./routes/authRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import servicosRoutes from "./routes/servicosRoutes.js";
import osRoutes from "./routes/osRoutes.js";
import caixaRoutes from "./routes/caixaRoutes.js";
import gastosRoutes from "./routes/gastosRoutes.js";
import auditoriaRoutes from "./routes/auditoriaRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import parceriaRoutes from "./routes/parceiraRoutes.js";

dotenv.config();
const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  "http://localhost:3000",
  "https://app-gerenciador-production.up.railway.app"
];

// Configura CORS para aceitar apenas origens autorizadas
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Bloqueado pelo CORS"));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// Preflight
app.options("*", cors());

// Permite JSON no body
app.use(express.json());

// Health-check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "conectado" });
  } catch {
    res.status(500).json({ status: "erro", db: "não conectado" });
  }
});

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(process.cwd(), "public/html")));
app.use("/css", express.static(path.join(process.cwd(), "public/css")));
app.use("/js", express.static(path.join(process.cwd(), "public/js")));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/servicos", servicosRoutes);
app.use("/api/os", osRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/parceiras", parceriaRoutes);

// Tratamento de erro (middleware final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
