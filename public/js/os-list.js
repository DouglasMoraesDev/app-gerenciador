// public/js/os-list.js

import { getOrdens, changeStatus } from "./api.js";
// Importa formatadores do util
import { formatBRL, parseBRL } from "./utils/format.js";

const container       = document.getElementById("os-container");
const filtroStatus   = document.getElementById("filtroStatus");
const modal           = document.getElementById("os-modal");
const closeBtn        = document.getElementById("modal-close");
const statusSelect    = document.getElementById("modal-status-select");
const pagamentoLabel  = document.getElementById("label-pagamento");
const pagamentoSelect = document.getElementById("modal-pagamento-select");
const finalizarBtn    = document.getElementById("modal-finalizar");

let ordens = [];
let currentOs = null;

async function load() {
  ordens = await getOrdens();
  renderCards();
}

function renderCards() {
  const filtro = filtroStatus.value; // '' ou 'PENDENTE' etc
  const lista = filtro
    ? ordens.filter(o => o.status === filtro)
    : ordens;

  container.innerHTML = lista.map(o => {
    // soma dos valores (itens)
    const total = o.itens.reduce((sum, i) => {
      const raw = i.valorServico;
      const valorNum = typeof raw === "number"
        ? raw
        : parseBRL(raw.toString());
      return sum + valorNum;
    }, 0);

    // Exibe cada item com valor em BRL
    const itensHtml = o.itens.map(i => {
      const raw = i.valorServico;
      const valorNum = typeof raw === "number"
        ? raw
        : parseBRL(i.valorServico.toString());
      return `<p>${i.servico.nome}: R$ ${formatBRL(valorNum)}</p>`;
    }).join("");

    return `
      <div class="card">
        <h3>${o.placa} – ${o.modelo}</h3>
        ${itensHtml}
        <p><strong>Status:</strong> ${o.status}</p>
        <p><strong>Total:</strong> R$ ${formatBRL(total)}</p>
        <button class="btn-status" data-id="${o.id}">Mudar Status</button>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".btn-status").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      openModal(ordens.find(o => o.id === id));
    });
  });
}

function openModal(os) {
  currentOs = os;

  const itensNomes = os.itens.map(i => i.servico.nome).join(", ");
  const total = os.itens.reduce((sum, i) => {
    const raw = i.valorServico;
    const valorNum = typeof raw === "number"
      ? raw
      : parseBRL(raw.toString());
    return sum + valorNum;
  }, 0);

  document.getElementById("modal-servico-nome").textContent = itensNomes;
  document.getElementById("modal-carro-info").textContent =
    `${os.placa} (${os.modelo})`;
  document.getElementById("modal-descricao").textContent =
    os.itens.map(i => i.servico.descricao || "").join("; ");
  document.getElementById("modal-valor").textContent =
    formatBRL(total);
  document.getElementById("modal-criado-em").textContent =
    new Date(os.criadoEm).toLocaleString();

  statusSelect.value      = os.status;
  pagamentoSelect.value   = os.modalidadePagamento || "PIX";
  pagamentoLabel.style.display  = "none";
  pagamentoSelect.style.display = "none";
  finalizarBtn.disabled        = true;

  if (os.status === "ENTREGUE") {
    statusSelect.disabled     = true;
    finalizarBtn.style.display = "none";
  } else {
    statusSelect.disabled     = false;
    finalizarBtn.style.display = "inline-block";
  }

  modal.style.display = "flex";
}

closeBtn.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Quando muda status no modal
statusSelect.addEventListener("change", () => {
  const novo = statusSelect.value;
  if (novo === "ENTREGUE") {
    pagamentoLabel.style.display  = "block";
    pagamentoSelect.style.display = "block";
    finalizarBtn.disabled          = false;
  } else {
    changeStatus(currentOs.id, novo, null)
      .then(() => {
        modal.style.display = "none";
        load();
      })
      .catch(err => alert("Erro: " + err.message));
  }
});

// Quando clica em Finalizar
finalizarBtn.addEventListener("click", () => {
  const tipoPag = pagamentoSelect.value;
  changeStatus(currentOs.id, "ENTREGUE", tipoPag)
    .then(() => {
      modal.style.display = "none";
      load();
    })
    .catch(err => alert("Erro: " + err.message));
});

// Re-renderiza quando mudar filtro
filtroStatus.addEventListener("change", renderCards);

document.addEventListener("DOMContentLoaded", load);
