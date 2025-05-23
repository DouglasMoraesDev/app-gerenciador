// src/controllers/osController.js
import prisma from '../prismaClient.js'  // seu Prisma Client

// Listar todas as OS
export async function getTodasOS(req, res) {
  try {
    const lista = await prisma.os.findMany()  // use o nome do model em lowerCamelCase
    return res.json(lista)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Buscar OS por ID
export async function getOSById(req, res) {
  try {
    const { id } = req.params
    const os = await prisma.os.findUnique({ where: { id: Number(id) } })
    if (!os) return res.status(404).json({ error: 'OS não encontrada' })
    return res.json(os)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Criar nova OS
export async function criarOS(req, res) {
  try {
    const dados = req.body
    const os = await prisma.os.create({ data: dados })
    return res.status(201).json(os)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

// Atualizar OS
export async function atualizarOS(req, res) {
  try {
    const { id } = req.params
    const dados = req.body
    const os = await prisma.os.update({
      where: { id: Number(id) },
      data: dados,
    })
    return res.json(os)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

// Deletar OS
export async function deletarOS(req, res) {
  try {
    const { id } = req.params
    await prisma.os.delete({ where: { id: Number(id) } })
    return res.status(204).send()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Patch de status da OS
export async function patchStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body
    const os = await prisma.os.update({
      where: { id: Number(id) },
      data: { status },
    })
    return res.json(os)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}
