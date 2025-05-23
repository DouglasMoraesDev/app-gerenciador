// public/js/api.js

// Detecta se estamos em ambiente de desenvolvimento (localhost) ou produção
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const BASE_URL = IS_LOCAL
  ? "http://localhost:3000"                              // API local em dev
  : "https://app-gerenciador-production.up.railway.app";  // API no Railway em prod

// ================================
// AUTENTICAÇÃO
// ================================
export async function registerUser({ nome, email, senha }) {
  const resp = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao registrar usuário");
  }
  return resp.json();
}

export async function loginUser(email, senha) {
  const resp = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Credenciais inválidas");
  }
  return resp.json(); // retorna { token }
}

// ================================
// CLIENTES
// ================================
export async function getClientes() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/clientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar clientes");
  return resp.json();
}

export async function getClienteById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/clientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Cliente não encontrado");
  return resp.json();
}

export async function criarCliente(dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao criar cliente");
  }
  return resp.json();
}

export async function atualizarCliente(id, dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/clientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao atualizar cliente");
  }
  return resp.json();
}

export async function excluirCliente(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/clientes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao excluir cliente");
  }
}

// ================================
// ORDENS DE SERVIÇO
// ================================
export async function getOrdens() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar ordens de serviço");
  return resp.json();
}

export async function getOrdemById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Ordem de serviço não encontrada");
  return resp.json();
}

export async function criarOrdem(dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao criar ordem de serviço");
  }
  return resp.json();
}

export async function atualizarOrdem(id, dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao atualizar ordem de serviço");
  }
  return resp.json();
}

export async function excluirOrdem(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao excluir ordem de serviço");
  }
}

// ================================
// CAIXA
// ================================
export async function getCaixaAtual() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/caixa/atual`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Nenhum caixa aberto");
  return resp.json();
}

export async function abrirCaixa(saldoInicial = 0) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/caixa/abrir`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ saldoInicial }),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao abrir caixa");
  }
  return resp.json();
}

export async function fecharCaixa(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/caixa/fechar/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao fechar caixa");
  }
  return resp.json();
}

export async function getMovimentacoes() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/caixa/movimentacoes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar movimentações");
  return resp.json();
}
