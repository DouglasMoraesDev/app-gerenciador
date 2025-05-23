import osService from "../services/osService.js";

export async function getTodasOS(req, res, next) {
  try {
    const lista = await osService.getTodas();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

export async function getOSById(req, res, next) {
  try {
    const { id } = req.params;
    const os = await osService.getPorId(Number(id));
    if (!os) {
      return res.status(404).json({ error: "OS não encontrada" });
    }
    res.json(os);
  } catch (err) {
    next(err);
  }
}

export async function criarOS(req, res, next) {
  try {
    const dados = req.body;
    const novaOS = await osService.criar(dados);
    res.status(201).json(novaOS);
  } catch (err) {
    next(err);
  }
}

export async function atualizarOS(req, res, next) {
  try {
    const { id } = req.params;
    const dados = req.body;
    const atualizada = await osService.atualizar(Number(id), dados);
    res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

export async function deletarOS(req, res, next) {
  try {
    const { id } = req.params;
    await osService.deletar(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}