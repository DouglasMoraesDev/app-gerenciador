// src/controllers/osController.js
import OsModel from '../models/OsModel.js'; // ajuste para o seu model real

// Listar todas as OS
export async function getTodasOS(req, res) {
  try {
    const lista = await OsModel.findAll();
    return res.json(lista);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Buscar OS por ID
export async function getOSById(req, res) {
  try {
    const { id } = req.params;
    const os = await OsModel.findByPk(id);
    if (!os) return res.status(404).json({ error: 'OS não encontrada' });
    return res.json(os);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Criar nova OS
export async function criarOS(req, res) {
  try {
    const dados = req.body;
    const os = await OsModel.create(dados);
    return res.status(201).json(os);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// Atualizar OS
export async function atualizarOS(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;
    const os = await OsModel.findByPk(id);
    if (!os) return res.status(404).json({ error: 'OS não encontrada' });
    await os.update(dados);
    return res.json(os);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// Deletar OS
export async function deletarOS(req, res) {
  try {
    const { id } = req.params;
    const os = await OsModel.findByPk(id);
    if (!os) return res.status(404).json({ error: 'OS não encontrada' });
    await os.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Patch de status da OS
export async function patchStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const os = await OsModel.findByPk(id);
    if (!os) return res.status(404).json({ error: 'OS não encontrada' });
    os.status = status;
    await os.save();
    return res.json(os);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
