import servicosService from "../services/servicosService.js";

// GET /api/servicos
export async function getTodosServicos(req, res, next) {
  try {
    const lista = await servicosService.getTodos();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

// GET /api/servicos/:id
export async function getServicoById(req, res, next) {
  try {
    const { id } = req.params;
    const servico = await servicosService.getPorId(Number(id));
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }
    res.json(servico);
  } catch (err) {
    next(err);
  }
}

// POST /api/servicos
export async function criarServico(req, res, next) {
  try {
    const { nome, descricao, valor } = req.body;
    if (!nome || !descricao || valor == null) {
      return res.status(400).json({ error: "Nome, descrição e valor são obrigatórios." });
    }
    if (valor < 0) {
      return res.status(400).json({ error: "Valor não pode ser negativo." });
    }

    try {
      const novoServico = await servicosService.criar({ nome, descricao, valor });
      res.status(201).json(novoServico);
    } catch (prismaErr) {
      if (prismaErr.code === "P2002" && prismaErr.meta.target.includes("nome")) {
        return res.status(409).json({ error: "Serviço com esse nome já existe." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}

// PUT /api/servicos/:id
export async function atualizarServico(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, descricao, valor } = req.body;
    if (!nome || !descricao || valor == null) {
      return res.status(400).json({ error: "Nome, descrição e valor são obrigatórios." });
    }
    if (valor < 0) {
      return res.status(400).json({ error: "Valor não pode ser negativo." });
    }

    try {
      const servicoAtualizado = await servicosService.atualizar(Number(id), { nome, descricao, valor });
      res.json(servicoAtualizado);
    } catch (prismaErr) {
      if (prismaErr.code === "P2025") {
        return res.status(404).json({ error: "Serviço não encontrado." });
      }
      if (prismaErr.code === "P2002" && prismaErr.meta.target.includes("nome")) {
        return res.status(409).json({ error: "Serviço com esse nome já existe." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}

// DELETE /api/servicos/:id
export async function deletarServico(req, res, next) {
  try {
    const { id } = req.params;
    try {
      await servicosService.deletar(Number(id));
      res.status(204).send();
    } catch (prismaErr) {
      if (prismaErr.code === "P2025") {
        return res.status(404).json({ error: "Serviço não encontrado." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}
