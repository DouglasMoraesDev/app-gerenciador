// public/js/caixa.js

import {
  getCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  getMovimentacoes,
  BASE_URL,
} from "./api.js";

async function renderMovimentacoes() {
  const tbody = document.querySelector("#mov-table tbody");
  tbody.innerHTML = "";
  try {
    const movs = await getMovimentacoes();
    movs.forEach((mov) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mov.tipo}</td>
        <td>R$ ${mov.valor.toFixed(2)}</td>
        <td>${new Date(mov.createdAt).toLocaleString()}</td>
        <td>${mov.usuario.nome}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function renderCaixaUI() {
  const abrirBtn = document.getElementById("abrir-caixa-btn");
  const fecharBtn = document.getElementById("fechar-caixa-btn");
  const saldoEl = document.getElementById("saldo-valor");

  try {
    const caixa = await getCaixaAtual();
    if (caixa) {
      abrirBtn.disabled = true;
      fecharBtn.disabled = false;
      saldoEl.textContent = `R$ ${caixa.entradas.toFixed(2)}`;
      renderMovimentacoes();
    } else {
      abrirBtn.disabled = false;
      fecharBtn.disabled = true;
      saldoEl.textContent = "R$ 0,00";
      document.querySelector("#mov-table tbody").innerHTML = "";
    }
  } catch {
    abrirBtn.disabled = false;
    fecharBtn.disabled = true;
    saldoEl.textContent = "R$ 0,00";
    document.querySelector("#mov-table tbody").innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCaixaUI();
  document.getElementById("abrir-caixa-btn").addEventListener("click", async () => {
    try {
      await abrirCaixa(0);
      renderCaixaUI();
    } catch (err) {
      alert(err.message);
    }
  });
  document.getElementById("fechar-caixa-btn").addEventListener("click", async () => {
    try {
      const caixa = await getCaixaAtual();
      if (caixa) {
        await fecharCaixa(caixa.id);
        renderCaixaUI();
      }
    } catch (err) {
      alert(err.message);
    }
  });
});
