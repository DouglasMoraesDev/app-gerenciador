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

/**
 * Faz o registro de um novo usuário.
 * Espera um objeto { nome, email, senha }.
 * Retorna a resposta JSON contendo informações do usuário registrado.
 */
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

/**
 * Faz login de um usuário existente.
 * Recebe email e senha. Retorna { token } em caso de sucesso.
 */
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
// CARROS
// ================================

/**
 * Busca todos os carros cadastrados.
 * Adiciona o header de Authorization com o token salvo no localStorage.
 * Retorna um array JSON dos carros.
 */
export async function getCarros() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar carros");
  return resp.json();
}

/**
 * Busca um carro específico pelo ID.
 * Recebe o ID como parâmetro e retorna o objeto carro em JSON.
 */
export async function getCarroById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/carros/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Carro não encontrado");
  return resp.json();
}

/**
 * Cria um novo carro.
 * Recebe um objeto 'dados' contendo as propriedades esperadas pelo backend.
 * Retorna o carro criado em JSON.
 */
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

/**
 * Atualiza um carro existente pelo ID.
 * Recebe o ID e um objeto 'dados' com os campos a serem atualizados.
 * Retorna o carro atualizado em JSON.
 */
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

/**
 * Exclui um carro pelo ID.
 * Retorna vazio em caso de sucesso (status 204).
 */
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
  // DELETE costuma não retornar body
  return;
}

// ================================
// SERVIÇOS
// ================================

/**
 * Busca todos os serviços cadastrados.
 * Retorna um array JSON de serviços.
 */
export async function getServicos() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar serviços");
  return resp.json();
}

/**
 * Busca um serviço específico pelo ID.
 * Retorna o objeto serviço em JSON.
 */
export async function getServicoById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/servicos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Serviço não encontrado");
  return resp.json();
}

/**
 * Cria um novo serviço.
 * Recebe um objeto 'dados' contendo { nome, descricao, valor, etc }.
 * Retorna o serviço criado em JSON.
 */
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

/**
 * Atualiza um serviço existente pelo ID.
 * Recebe o ID e um objeto 'dados' com os campos a serem atualizados.
 * Retorna o serviço atualizado em JSON.
 */
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

/**
 * Exclui um serviço pelo ID.
 * Retorna vazio em caso de sucesso (status 204).
 */
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
  return;
}

// ================================
// ORDENS DE SERVIÇO
// ================================

/**
 * Busca todas as ordens de serviço (OS) existentes.
 * Retorna um array JSON de OS.
 */
export async function getOrdens() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar ordens de serviço");
  return resp.json();
}

/**
 * Busca uma ordem de serviço específica pelo ID.
 * Retorna o objeto OS em JSON.
 */
export async function getOrdemById(id) {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/os/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Ordem de serviço não encontrada");
  return resp.json();
}

/**
 * Cria uma nova ordem de serviço.
 * Recebe um objeto 'dados' com as propriedades:
 *   - carroId (Number, obrigatório)
 *   - servicoId (Number, obrigatório)
 *   - descricaoServico (String, opcional para exibição)
 *   - valorServico (Number, opcional)
 *   - status (String, obrigatório: “PENDENTE”, “EM_ANDAMENTO” etc)
 *   - parceiroId (Number, opcional: ID da empresa parceira)
 *
 * Retorna o objeto OS criado em JSON, incluindo dados de carro, serviço e, se houver, parceiro.
 */
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

/**
 * Altera o status de uma ordem de serviço (os/:id/status).
 * Recebe o ID da OS, o novo status e, opcionalmente, modalidadePagamento (quando ENTREGUE).
 * Retorna a OS atualizada em JSON.
 */
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

/**
 * Busca o caixa atual (aquele que não foi fechado ainda).
 * Retorna o objeto caixa atual em JSON.
 */
export async function getCaixaAtual() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/caixa/atual`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Nenhum caixa aberto");
  return resp.json();
}

/**
 * Abre um novo caixa, recebendo opcionalmente o saldoInicial.
 * Retorna o objeto caixa criado em JSON.
 */
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

/**
 * Fecha um caixa existente pelo ID.
 * Retorna o caixa fechado em JSON.
 */
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

/**
 * Busca todas as movimentações do caixa (entradas e saídas).
 * Retorna um array JSON de movimentações.
 */
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

/**
 * Busca todos os gastos cadastrados.
 * Retorna um array JSON de gastos.
 */
export async function getGastos() {
  const token = localStorage.getItem("token");
  const resp = await fetch(`${BASE_URL}/api/gastos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Erro ao buscar gastos");
  return resp.json();
}

/**
 * Cria um novo gasto.
 * Recebe um objeto 'dados' contendo as propriedades do gasto.
 * Retorna o gasto criado em JSON.
 */
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

/**
 * Exclui um gasto pelo ID.
 * Retorna vazio em caso de sucesso (status 204).
 */
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
  return;
}

// ================================
// AUDITORIA
// ================================

/**
 * Gera relatório de auditoria com base em período (ex: 'mensal', 'anual') e valor mínimo de movimentação.
 * Retorna um array JSON com o relatório.
 */
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

/**
 * Busca movimentações de auditoria em um intervalo de datas (start e end no formato YYYY-MM-DD).
 * Retorna um array JSON com as movimentações encontradas.
 */
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
    body: formData, // FormData, não JSON, para permitir upload de PDF
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao criar empresa parceira");
  }
  return resp.json();
}

/**
 * Busca ordens de serviço de um parceiro em intervalo de datas.
 * Utilizado para gerar relatórios mensais/por período na página de Parceiras.
 * Recebe:
 *   - parceiroId (Number ou String)
 *   - start (String no formato "YYYY-MM-DD")
 *   - end   (String no formato "YYYY-MM-DD")
 *
 * Retorna um array JSON de OS que atendem ao filtro.
 */
export async function getOSPorParceiro(parceiroId, start, end) {
  const token = localStorage.getItem("token");
  const resp = await fetch(
    `${BASE_URL}/api/os/parceiro?parceiroId=${parceiroId}&start=${start}&end=${end}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) throw new Error("Erro ao buscar OS do parceiro");
  return resp.json();
}
