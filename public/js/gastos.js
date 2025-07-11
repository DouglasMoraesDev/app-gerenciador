// public/js/gastos.js

import { getCaixaAtual, getGastos, criarGasto, excluirGasto } from "./api.js";
// Importa formatadores do util
import { formatBRL, parseBRL } from "./utils/format.js";

const form = document.getElementById("gasto-form");
const container = document.getElementById("gastos-container");

async function loadGastos() {
  container.innerHTML = "";
  try {
    const gastos = await getGastos();
    if (!gastos.length) {
      container.innerHTML = "<p>Nenhum gasto registrado.</p>";
      return;
    }

    gastos.forEach(g => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <p><strong>Descrição:</strong> ${g.descricao}</p>
        <p><strong>Valor:</strong> <strong>R$ ${formatBRL(g.valor)}</strong></p>
        <p><strong>Data:</strong> ${new Date(g.data).toLocaleDateString()}</p>
        <button>Excluir</button>
      `;
      card.querySelector("button").onclick = async () => {
        if (confirm("Excluir gasto?")) {
          await excluirGasto(g.id);
          loadGastos();
        }
      };
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar: ${err.message}</p>`;
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  // Verifica se há caixa aberto
  let caixa;
  try {
    caixa = await getCaixaAtual();
  } catch {
    caixa = null;
  }
  if (!caixa) {
    return alert("Você precisa abrir o Caixa antes de registrar gastos.");
  }

  const descricao = form.descricao.value.trim();
  const valor     = form.valor.valueAsNumber;  // <-- usa valueAsNumber em vez de parseBRL
  const data      = form.data.value;

  if (!descricao || valor == null || !data) {
    return alert("Preencha todos os campos corretamente.");
  }

  if (isNaN(valor) || valor <= 0) {
    return alert("Valor inválido. Use um número maior que zero.");
  }

  try {
    await criarGasto({ descricao, valor, data });
    form.reset();
    loadGastos();
  } catch (err) {
    alert("Erro ao registrar gasto: " + err.message);
  }
});

document.addEventListener("DOMContentLoaded", loadGastos);
