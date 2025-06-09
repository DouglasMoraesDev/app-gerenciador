// public/js/caixa.js

import {
  getCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  getMovimentacoes
} from "./api.js";

// Importa formatadores do util
import { formatBRL, parseBRL } from "./utils/format.js";

const cardsContainer = document.getElementById("caixa-cards");
const movModal       = document.getElementById("mov-modal");
const movList        = document.getElementById("mov-list");
const movModalClose  = document.getElementById("mov-modal-close");

let caixaAtual = null;

// Fecha o modal de movimentações
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

  // ----- Card de Ações -----
  const acoesCard = document.createElement("div");
  acoesCard.className = "card";

  if (!caixaAtual) {
    // Se não há caixa aberto, exibe campo para saldo inicial + botão abrir
    acoesCard.innerHTML = `
      <h3>Ações</h3>
      <div style="margin-bottom: 10px;">
        <label for="input-saldo-inicial" style="font-size:0.9rem;">Saldo Inicial (R$):</label><br/>
        <input 
          type="text" 
          id="input-saldo-inicial" 
          placeholder="1.234,56" 
          style="width: 100%; margin-top:4px; padding:4px;" 
        />
      </div>
      <button id="btn-abrir">Abrir Caixa</button>
      <button id="btn-fechar" disabled>Fechar Caixa</button>
    `;
  } else {
    // Se já existe caixa aberto, mostra o botão de fechar
    acoesCard.innerHTML = `
      <h3>Ações</h3>
      <button id="btn-abrir" disabled>Abrir Caixa</button>
      <button id="btn-fechar">Fechar Caixa</button>
    `;
  }
  cardsContainer.appendChild(acoesCard);

  // ----- Card de Saldo -----
  const saldoStr = caixaAtual
    ? formatBRL(caixaAtual.saldoInicial + caixaAtual.entradas - caixaAtual.saidas)
    : "0,00";
  const saldoCard = document.createElement("div");
  saldoCard.className = "card";
  saldoCard.innerHTML = `
    <h3>Saldo Atual</h3>
    <p>R$ ${saldoStr}</p>
  `;
  cardsContainer.appendChild(saldoCard);

  // ----- Card de Movimentações -----
  const movCard = document.createElement("div");
  movCard.className = "card";
  movCard.innerHTML = `
    <h3>Movimentações</h3>
    <p>Clique para ver</p>
  `;
  movCard.style.cursor = "pointer";
  movCard.addEventListener("click", openMovModal);
  cardsContainer.appendChild(movCard);

  // ----- Handlers dos botões -----
  document.getElementById("btn-abrir").onclick  = onAbrirCaixa;
  document.getElementById("btn-fechar").onclick = onFecharCaixa;
}

// Abre o caixa usando o valor digitado no input
async function onAbrirCaixa() {
  const input = document.getElementById("input-saldo-inicial");
  if (!input) return;

  const raw = input.value.trim();
  const valor = parseBRL(raw);
  if (isNaN(valor) || valor < 0) {
    return alert("Valor inválido. Use formato 1.234,56");
  }

  try {
    await abrirCaixa(valor);
    await loadCaixa();
  } catch (err) {
    alert("Erro ao abrir caixa: " + err.message);
  }
}

// Fecha o caixa atual
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
      movList.innerHTML = movs.map(mov => {
        const tipoLabel = mov.tipo === "ENTRADA" ? "Entrada" : "Saída";
        // Formata o valor em BRL
        const valorStr = formatBRL(mov.valor);
        // Origem: se tiver ordem, mostra número da OS; caso contrário, assume “Gasto”
        const origem = mov.ordem ? `OS #${mov.ordem.id}` : "Gasto";
        return `
          <div class="card" style="text-align:left; margin-bottom:10px;">
            <p><strong>Tipo:</strong> ${tipoLabel}</p>
            <p><strong>Valor:</strong> R$ ${valorStr}</p>
            <p><strong>Data:</strong> ${new Date(mov.createdAt).toLocaleString()}</p>
            <p><strong>Origem:</strong> ${origem}</p>
          </div>
        `;
      }).join("");
    }
  } catch (err) {
    movList.innerHTML = `<p>Erro ao carregar: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadCaixa);
