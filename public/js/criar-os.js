import {
  getClientes,
  getServicos,
  criarOrdem
} from "./api.js";

const form = document.getElementById("criar-os-form");
const clienteSelect = document.getElementById("clienteId");
const servicoSelect = document.getElementById("servicoId");
const buscaCliente = document.getElementById("busca-cliente");
const buscaServico = document.getElementById("busca-servico");
const descricaoServicoEl = document.getElementById("descricaoServico");
const valorServicoEl = document.getElementById("valorServico");

// Carrega lista de clientes e serviços para os selects
async function loadDados() {
  const clientes = await getClientes();
  clienteSelect.innerHTML = `<option value="">-- selecione cliente --</option>`;
  clientes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nome} (${c.veiculo} - ${c.placa})`;
    clienteSelect.appendChild(opt);
  });

  const servicos = await getServicos();
  servicoSelect.innerHTML = `<option value="">-- selecione serviço --</option>`;
  servicos.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.nome} (R$ ${s.valor.toFixed(2)})`;
    servicoSelect.appendChild(opt);
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
  const descricaoServico = form.descricaoServico.value.trim();
  const valorServico = parseFloat(form.valorServico.value);
  const status = form.status.value;

  if (!clienteId) {
    return alert("Selecione um cliente.");
  }
  if (!servicoId) {
    return alert("Selecione um serviço.");
  }

  const dados = { clienteId, servicoId, descricaoServico, valorServico, status };
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

document.addEventListener("DOMContentLoaded", loadDados);
