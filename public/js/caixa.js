// caixa.js
import {
  getCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  getMovimentacoes
} from "./api.js";

const cardsContainer = document.getElementById("caixa-cards");
const movModal       = document.getElementById("mov-modal");
const movList        = document.getElementById("mov-list");
const movModalClose  = document.getElementById("mov-modal-close");

let caixaAtual = null;

// Fecha o modal
movModalClose.addEventListener("click", () => movModal.style.display = "none");
movModal.addEventListener("click", e => {
  if (e.target === movModal) movModal.style.display = "none";
});

// Carrega e renderiza os cards
async function loadCaixa() {
  cardsContainer.innerHTML = "";
  try {
    caixaAtual = await getCaixaAtual();
  } catch {
    caixaAtual = null;
  }

  // Card de Ações
  const acoesCard = document.createElement("div");
  acoesCard.className = "card";
  acoesCard.innerHTML = `
    <h3>Ações</h3>
    <button id="btn-abrir">Abrir Caixa</button>
    <button id="btn-fechar" ${caixaAtual ? "" : "disabled"}>Fechar Caixa</button>
  `;
  cardsContainer.appendChild(acoesCard);

  // Card de Saldo
  const saldo = caixaAtual
    ? (caixaAtual.saldoInicial + caixaAtual.entradas - caixaAtual.saidas).toFixed(2)
    : "0.00";
  const saldoCard = document.createElement("div");
  saldoCard.className = "card";
  saldoCard.innerHTML = `<h3>Saldo Atual</h3><p>R$ ${saldo}</p>`;
  cardsContainer.appendChild(saldoCard);

  // Card de Movimentações
  const movCard = document.createElement("div");
  movCard.className = "card";
  movCard.innerHTML = `<h3>Movimentações</h3><p>Clique para ver</p>`;
  movCard.addEventListener("click", openMovModal);
  cardsContainer.appendChild(movCard);

  // Handlers dos botões
  document.getElementById("btn-abrir").onclick  = onAbrirCaixa;
  document.getElementById("btn-fechar").onclick = onFecharCaixa;
}

// Abrir Caixa
async function onAbrirCaixa() {
  const valor = parseFloat(prompt("Digite o saldo inicial:", "0"));
  if (isNaN(valor) || valor < 0) return alert("Valor inválido");
  try {
    await abrirCaixa(valor);
    await loadCaixa();
  } catch (err) {
    alert("Erro ao abrir caixa: " + err.message);
  }
}

// Fechar Caixa
async function onFecharCaixa() {
  if (!caixaAtual) return;
  try {
    await fecharCaixa(caixaAtual.id);
    await loadCaixa();
  } catch (err) {
    alert("Erro ao fechar caixa: " + err.message);
  }
}

// Abre modal com a lista de movimentações (somente leitura)
async function openMovModal() {
  movList.innerHTML = "<p>Carregando...</p>";
  movModal.style.display = "flex";
  try {
    const movs = await getMovimentacoes();
    if (movs.length === 0) {
      movList.innerHTML = "<p>Não há movimentações.</p>";
    } else {
      movList.innerHTML = movs.map(mov => `
        <div class="card" style="text-align:left; margin-bottom:10px;">
          <p><strong>Tipo:</strong> ${mov.tipo}</p>
          <p><strong>Valor:</strong> R$ ${mov.valor.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(mov.createdAt).toLocaleString()}</p>
          <p><strong>Origem:</strong> ${mov.ordem ? `OS #${mov.ordem.id}` : "Gasto"}</p>
        </div>
      `).join("");
    }
  } catch (err) {
    movList.innerHTML = `<p>Erro ao carregar: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadCaixa);
