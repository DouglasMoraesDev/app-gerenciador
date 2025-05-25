// public/js/criar-os.js

import {
  getClientes,
  getServicos,
  getParceiras,     // importar o helper para buscar empresas parceiras
  criarOrdem
} from "./api.js";

const form = document.getElementById("criar-os-form");
const clienteSelect = document.getElementById("clienteId");
const servicoSelect = document.getElementById("servicoId");
const buscaCliente = document.getElementById("busca-cliente");
const buscaServico = document.getElementById("busca-servico");
const descricaoServicoEl = document.getElementById("descricaoServico");
const valorServicoEl = document.getElementById("valorServico");

// **Novos elementos para Empresa Parceira**
const parceiroSelect = document.getElementById("parceiroId");
const buscaParceiro = document.getElementById("busca-parceiro");

/**
 * Carrega lista de clientes, serviços e parceiros para os selects
 */
async function loadDados() {
  // Carrega clientes
  const clientes = await getClientes();
  clienteSelect.innerHTML = `<option value="">-- selecione cliente --</option>`;
  clientes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nome} (${c.veiculo} - ${c.placa})`;
    clienteSelect.appendChild(opt);
  });

  // Carrega serviços
  const servicos = await getServicos();
  servicoSelect.innerHTML = `<option value="">-- selecione serviço --</option>`;
  servicos.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.nome} (R$ ${s.valor.toFixed(2)})`;
    servicoSelect.appendChild(opt);
  });

  // Carrega empresas parceiras
  const parceiros = await getParceiras();
  parceiroSelect.innerHTML = `<option value="">-- selecione empresa parceira --</option>`;
  parceiros.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nome} (R$ ${p.valorMensal.toFixed(2)}/mês)`;
    parceiroSelect.appendChild(opt);
  });
}

// Filtragem ao digitar nome do cliente
buscaCliente.addEventListener("input", async () => {
  const term = buscaCliente.value.trim().toLowerCase();
  const clientes = await getClientes();
  clienteSelect.innerHTML = `<option value="">-- selecione cliente --</option>`;
  clientes
    .filter(c => c.nome.toLowerCase().includes(term))
    .forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.nome} (${c.veiculo} - ${c.placa})`;
      clienteSelect.appendChild(opt);
    });
});

// Filtragem ao digitar nome do serviço
buscaServico.addEventListener("input", async () => {
  const term = buscaServico.value.trim().toLowerCase();
  const servicos = await getServicos();
  servicoSelect.innerHTML = `<option value="">-- selecione serviço --</option>`;
  servicos
    .filter(s => s.nome.toLowerCase().includes(term))
    .forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.nome} (R$ ${s.valor.toFixed(2)})`;
      servicoSelect.appendChild(opt);
    });
});

// **Filtragem ao digitar nome da empresa parceira**
buscaParceiro.addEventListener("input", async () => {
  const term = buscaParceiro.value.trim().toLowerCase();
  const parceiros = await getParceiras();
  parceiroSelect.innerHTML = `<option value="">-- selecione empresa parceira --</option>`;
  parceiros
    .filter(p => p.nome.toLowerCase().includes(term))
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nome} (R$ ${p.valorMensal.toFixed(2)}/mês)`;
      parceiroSelect.appendChild(opt);
    });
});

// Ao selecionar um serviço, pré-preencher descrição e valor
servicoSelect.addEventListener("change", async () => {
  const id = Number(servicoSelect.value);
  if (!id) {
    descricaoServicoEl.value = "";
    valorServicoEl.value = "";
    return;
  }
  const s = await getServicos().then(list => list.find(x => x.id === id));
  if (s) {
    descricaoServicoEl.value = s.descricao;
    valorServicoEl.value = s.valor.toFixed(2);
  } else {
    descricaoServicoEl.value = "";
    valorServicoEl.value = "";
  }
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const clienteId = Number(form.clienteId.value);
  const servicoId = Number(form.servicoId.value);
  const parceiroId = form.parceiroId.value ? Number(form.parceiroId.value) : null;
  const descricaoServico = form.descricaoServico.value.trim();
  const valorServico = parseFloat(form.valorServico.value);
  const status = form.status.value;

  if (!clienteId) {
    return alert("Selecione um cliente.");
  }
  if (!servicoId) {
    return alert("Selecione um serviço.");
  }

  // Monta objeto com dados, incluindo parceiroId apenas se selecionado
  const dados = { clienteId, servicoId, descricaoServico, valorServico, status };
  if (parceiroId) {
    dados.parceiroId = parceiroId;
  }

  try {
    await criarOrdem(dados);
    alert("Ordem criada com sucesso!");
    form.reset();
    descricaoServicoEl.value = "";
    valorServicoEl.value = "";
  } catch (err) {
    alert(`Erro ao criar ordem: ${err.message}`);
  }
});

// Ao carregar a página, busca clientes, serviços e parceiros
document.addEventListener("DOMContentLoaded", loadDados);
