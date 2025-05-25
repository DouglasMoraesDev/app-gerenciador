import clientesService from "../services/clientesService.js";
import { validarPlaca, validarEmail, validarTelefone } from "../utils/validators.js";

// GET /api/clientes
export async function getTodosClientes(req, res, next) {
  try {
    const lista = await clientesService.getTodos();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

// GET /api/clientes/:id
export async function getClienteById(req, res, next) {
  try {
    const { id } = req.params;
    const cliente = await clientesService.getPorId(Number(id));
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// POST /api/clientes
export async function criarCliente(req, res, next) {
  try {
    const { nome, telefone, email, veiculo, placa } = req.body;
    if (!nome || !veiculo || !placa) {
      return res.status(400).json({ error: "Nome, veículo e placa são obrigatórios." });
    }
    if (email && !validarEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }
    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ error: "Telefone inválido." });
    }
    if (!validarPlaca(placa)) {
      return res.status(400).json({ error: "Placa inválida." });
    }

    // Tentar criar no banco (placa é unique)
    try {
      const novoCli = await clientesService.criar({ nome, telefone, email, veiculo, placa });
      res.status(201).json(novoCli);
    } catch (prismaErr) {
      if (prismaErr.code === "P2002" && prismaErr.meta.target.includes("placa")) {
        return res.status(409).json({ error: "Placa já cadastrada." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}

// PUT /api/clientes/:id
export async function atualizarCliente(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, telefone, email, veiculo, placa } = req.body;
    if (!nome || !veiculo || !placa) {
      return res.status(400).json({ error: "Nome, veículo e placa são obrigatórios." });
    }
    if (email && !validarEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }
    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ error: "Telefone inválido." });
    }
    if (!validarPlaca(placa)) {
      return res.status(400).json({ error: "Placa inválida." });
    }

    try {
      const cliAtualizado = await clientesService.atualizar(Number(id), { nome, telefone, email, veiculo, placa });
      res.json(cliAtualizado);
    } catch (prismaErr) {
      if (prismaErr.code === "P2025") {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }
      if (prismaErr.code === "P2002" && prismaErr.meta.target.includes("placa")) {
        return res.status(409).json({ error: "Placa já cadastrada." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}

// DELETE /api/clientes/:id
export async function deletarCliente(req, res, next) {
  try {
    const { id } = req.params;
    try {
      await clientesService.deletar(Number(id));
      res.status(204).send();
    } catch (prismaErr) {
      if (prismaErr.code === "P2025") {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }
      next(prismaErr);
    }
  } catch (err) {
    next(err);
  }
}
