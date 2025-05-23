import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import prisma from "./prismaClient.js";        // agora será usado
import authRoutes from "./routes/authRoutes.js";
import osRoutes from "./routes/osRoutes.js";
import caixaRoutes from "./routes/caixaRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health-check simples que testa a conexão ao banco
app.get("/health", async (req, res) => {
  try {
    // Apenas uma consulta simples para verificar se o banco responde
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "conectado" });
  } catch (err) {
    res.status(500).json({ status: "erro", db: "não conectado" });
  }
});

// Serve arquivos estáticos se necessário (ex.: fetch de ícones)
app.use("/public", express.static("public"));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/os", osRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/clientes", clientesRoutes);

// Middleware de tratamento de erros (sempre por último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
