// public/js/criar-os.js

import {
  getCarros,
  getServicos,
  criarOrdem
} from "./api.js"; // certifique-se que api.js tenha getCarros()

const form = document.getElementById("criar-os-form");
const carroSelect = document.getElementById("carroId");
const servicoSelect = document.getElementById("servicoId");
const buscaCarro = document.getElementById("busca-carro");
const buscaServico = document.getElementById("busca-servico");
const descricaoServicoEl = document.getElementById("descricaoServico");
const valorServicoEl = document.getElementById("valorServico");

// Carrega lista de carros e serviços para os selects
async function loadDados() {
  const carros = await getCarros();
  carroSelect.innerHTML = `<option value="">-- selecione carro --</option>`;
  carros.forEach(c => {
    const opt = document.createElement("option");
    // Exibe placa e proprietário: “ABC-1234 (João Silva)”
    opt.value = c.id;
    opt.textContent = `${c.placa} (${c.proprietario})`;
    carroSelect.appendChild(opt);
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

// Filtragem ao digitar nome do carro (placa, modelo ou proprietário)
buscaCarro.addEventListener("input", async () => {
  const term = buscaCarro.value.trim().toLowerCase();
  const carros = await getCarros();
  carroSelect.innerHTML = `<option value="">-- selecione carro --</option>`;
  carros
    .filter(c => {
      return (
        c.placa.toLowerCase().includes(term) ||
        (c.modelo && c.modelo.toLowerCase().includes(term)) ||
        c.proprietario.toLowerCase().includes(term)
      );
    })
    .forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.placa} (${c.proprietario})`;
      carroSelect.appendChild(opt);
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

// Ao selecionar um serviço,
// pré-preenche descrição e valor (que agora é editável)
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
    valorServicoEl.value = s.valor.toFixed(2); // preenche, mas usuário pode alterar
  } else {
    descricaoServicoEl.value = "";
    valorServicoEl.value = "";
  }
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const carroId = Number(form.carroId.value);
  const servicoId = Number(form.servicoId.value);
  const descricaoServico = form.descricaoServico.value.trim();
  const valorServico = parseFloat(form.valorServico.value);
  const status = form.status.value;

  if (!carroId) {
    return alert("Selecione um carro.");
  }
  if (!servicoId) {
    return alert("Selecione um serviço.");
  }

  const dados = { carroId, servicoId, descricaoServico, valorServico, status };
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
