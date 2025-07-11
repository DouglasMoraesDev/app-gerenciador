// public/js/api.js

// Detecta se estamos em ambiente de desenvolvimento (localhost) ou produção
const IS_LOCAL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const BASE_URL = IS_LOCAL
  ? "http://localhost:3000"
  : "https://app-gerenciador-production.up.railway.app";

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
  return resp.json();
}

// ================================
// CARROS
// ================================

export async function getCarros() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar carros");
  return resp.json();
}

export async function getCarroById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Carro não encontrado");
  return resp.json();
}

export async function criarCarro(dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao criar carro");
  }
  return resp.json();
}

export async function atualizarCarro(id, dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao atualizar carro");
  }
  return resp.json();
}

export async function excluirCarro(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao excluir carro");
  }
}

// ================================
// SERVIÇOS
// ================================

export async function getServicos() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar serviços");
  return resp.json();
}

export async function getServicoById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Serviço não encontrado");
  return resp.json();
}

export async function criarServico(dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao criar serviço");
  }
  return resp.json();
}

export async function atualizarServico(id, dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao atualizar serviço");
  }
  return resp.json();
}

export async function excluirServico(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao excluir serviço");
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

export async function changeStatus(id, status, modalidadePagamento) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, modalidadePagamento }),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao alterar status");
  }
  return resp.json();
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

// ================================
// GASTOS
// ================================

export async function getGastos() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/gastos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar gastos");
  return resp.json();
}

export async function criarGasto(dados) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/gastos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao criar gasto");
  }
  return resp.json();
}

export async function excluirGasto(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/gastos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao excluir gasto");
  }
}

// ================================
// AUDITORIA
// ================================

export async function gerarRelatorio(periodo, valor) {
  const token = localStorage.getItem("token");
  const resp = await fetch(
    `${BASE_URL}/api/auditoria?periodo=${periodo}&valor=${valor}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!resp.ok) {
    const erroJson = await resp.json();
    throw new Error(erroJson.error || "Erro ao gerar relatório");
  }
  return resp.json();
}

export async function getMovimentacoesRange(start, end) {
  const token = localStorage.getItem("token");
  const resp = await fetch(
    `${BASE_URL}/api/auditoria/range?start=${start}&end=${end}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao buscar movimentações por intervalo");
  }
  return resp.json();
}

// ================================
// EMPRESAS PARCEIRAS
// ================================
/**
 * Busca todas as empresas parceiras cadastradas.
 * Retorna um array JSON com as empresas parceiras.
 */
export async function getParceiras() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/parceiras`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar empresas parceiras");
  return resp.json();
}

/**
 * Cria uma nova empresa parceira.
 * Recebe um FormData (para envio de arquivo PDF de contrato, se houver).
 * O FormData deve conter:
 *   - nome (String)
 *   - cnpj (String com 14 dígitos numéricos)
 *   - descricao (String)
 *   - valorMensal (Number)
 *   - contrato (File, opcional, tipo PDF)
 *
 * Retorna a empresa parceira criada em JSON.
 */
export async function criarParceira(formData) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/parceiras`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData, não JSON
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao criar empresa parceira");
  }
  return resp.json();
}

/**
 * Atualiza uma empresa parceira existente (sem upload de PDF).
 * Recebe id e objeto JSON com os campos.
 */
export async function atualizarParceira(id, data) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/parceiras/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao atualizar empresa parceira");
  }
  return resp.json();
}

/**
 * Exclui uma empresa parceira pelo ID.
 */
export async function deletarParceira(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/parceiras/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao excluir empresa parceira");
  }
  return;
}

/**
 * Busca ordens de serviço de um parceiro em intervalo de datas (start e end no formato YYYY-MM-DD).
 * Retorna um array JSON de OS que atendem ao filtro.
 */
export async function getOSPorParceiro(parceiroId, start, end) {
  const token = localStorage.getItem("token");
  const resp = await fetch(
    `${BASE_URL}/api/os/parceiro?parceiroId=${parceiroId}&start=${start}&end=${end}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao buscar OS do parceiro");
  }
  return resp.json();
}
