// public/js/os-list.js

import { getOrdens, changeStatus } from "./api.js";

const filtro             = document.getElementById("filtroStatus");
const container          = document.getElementById("os-container");
const modal              = document.getElementById("os-modal");
const closeBtn           = document.getElementById("modal-close");
const statusSelect       = document.getElementById("modal-status-select");
const pagamentoSelect    = document.getElementById("modal-pagamento-select");
const labelPagamento     = document.getElementById("label-pagamento");
const finalizarBtn       = document.getElementById("modal-finalizar");

let ordens    = [];
let currentOs = null;

// Abre o modal e preenche dados
function openModal(os) {
  currentOs = os;
  document.getElementById("modal-servico-nome").textContent = os.servico.nome;
  // Exibir placa e proprietário
  document.getElementById("modal-carro-info").textContent = `${os.carro.placa} (${os.carro.proprietario})`;
  document.getElementById("modal-descricao").textContent    = os.descricaoServico;
  document.getElementById("modal-valor").textContent        = os.valorServico.toFixed(2);
  document.getElementById("modal-criado-em").textContent    = new Date(os.criadoEm).toLocaleString();

  statusSelect.value = os.status;
  labelPagamento.style.display   = "none";
  pagamentoSelect.style.display = "none";
  finalizarBtn.disabled          = true;

  if (os.status === "ENTREGUE") {
    statusSelect.disabled      = true;
    finalizarBtn.style.display = "none";
  } else {
    statusSelect.disabled      = false;
    finalizarBtn.style.display = "block";
  }

  modal.style.display = "flex";
}

// Fecha o modal
closeBtn.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Muda status para não-ENTREGUE
statusSelect.addEventListener("change", async () => {
  if (!currentOs) return;
  if (statusSelect.value === "ENTREGUE") {
    labelPagamento.style.display   = "block";
    pagamentoSelect.style.display = "block";
    pagamentoSelect.value          = "PIX";
    finalizarBtn.disabled          = false;
  } else {
    labelPagamento.style.display   = "none";
    pagamentoSelect.style.display = "none";
    finalizarBtn.disabled          = true;
    try {
      await changeStatus(currentOs.id, statusSelect.value, null);
      await load();
    } catch (err) {
      alert("Erro ao alterar status: " + err.message);
    }
  }
});

// Finalizar OS
finalizarBtn.addEventListener("click", async () => {
  if (!currentOs) return;
  finalizarBtn.disabled      = true;
  statusSelect.disabled      = true;
  pagamentoSelect.disabled   = true;

  try {
    await changeStatus(currentOs.id, "ENTREGUE", pagamentoSelect.value);
    await load();
    openModal({ ...currentOs, status: "ENTREGUE", modalidadePagamento: pagamentoSelect.value });
  } catch (err) {
    alert("Erro ao finalizar: " + err.message);
    finalizarBtn.disabled    = false;
    statusSelect.disabled    = false;
    pagamentoSelect.disabled = false;
  }
});

// Renderiza os cards
function renderCards(list) {
  container.innerHTML = "";
  list.forEach(os => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>OS #${os.id}: ${os.servico.nome}</h3>
      <p><strong>Carro:</strong> ${os.carro.placa} (${os.carro.proprietario})</p>
      <p><strong>Status:</strong> ${os.status}</p>
      <p><strong>Valor:</strong> R$ ${os.valorServico.toFixed(2)}</p>
    `;
    card.addEventListener("click", () => openModal(os));
    container.appendChild(card);
  });
}

// Carrega e filtra ordens do dia
async function load() {
  try {
    const todas   = await getOrdens();
    const hojeStr = new Date().toDateString();
    ordens = todas.filter(os => new Date(os.criadoEm).toDateString() === hojeStr);
    const filtroVal = filtro.value;
    const lista = filtroVal
      ? ordens.filter(o => o.status === filtroVal)
      : ordens;
    renderCards(lista);
  } catch (err) {
    alert("Erro ao carregar ordens: " + err.message);
  }
}

filtro.addEventListener("change", load);
document.addEventListener("DOMContentLoaded", load);
