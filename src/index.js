import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import prisma from "./prismaClient.js";
import authRoutes from "./routes/authRoutes.js";
import osRoutes from "./routes/osRoutes.js";
import caixaRoutes from "./routes/caixaRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import estoqueRoutes from './routes/estoqueRoutes.js';
import auditoriaRoutes from './routes/auditoriaRoutes.js';

dotenv.config();
const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  "http://localhost:3000",
  "https://app-gerenciador-production.up.railway.app"
];

// Configura CORS para aceitar esses dois domínios
app.use(cors({
  origin: (origin, callback) => {
    // permitir requisições sem origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Bloqueado pelo CORS"));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// Para responder corretamente ao preflight (OPTIONS)
app.options("*", cors());

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

// Serve estáticos
app.use(express.static(path.join(process.cwd(), "public/html")));
app.use("/css", express.static(path.join(process.cwd(), "public/css")));
app.use("/js", express.static(path.join(process.cwd(), "public/js")));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/os", osRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/clientes", clientesRoutes);

app.use('/api/estoque', estoqueRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Tratamento de erro
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
