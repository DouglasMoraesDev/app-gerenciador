// auditoria.js
import {
  getMovimentacoes,
  gerarRelatorio
} from "./api.js";

const cardEnt   = document.getElementById("card-entradas");
const cardSai   = document.getElementById("card-saidas");
const cardPdf   = document.getElementById("card-gerar");
const mesInput  = document.getElementById("mes");
const anoInput  = document.getElementById("ano");
const btnMes    = document.getElementById("btn-mes");
const btnAno    = document.getElementById("btn-ano");
const modal     = document.getElementById("audit-modal");
const modalBody = document.getElementById("audit-body");
const modalTitle= document.getElementById("audit-title");
const closeBtn  = document.getElementById("audit-close");

// Fecha modal
closeBtn.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Exibe movimentações de Entradas ou Saídas
async function showMovimentacoes(tipo) {
  modalTitle.textContent = tipo === "ENTRADA" ? "Entradas" : "Saídas";
  modalBody.innerHTML = "<p>Carregando...</p>";
  modal.style.display = "flex";
  try {
    const movs = await getMovimentacoes();
    const filtrados = movs.filter(m => m.tipo === (tipo === "ENTRADA" ? "ENTRADA" : "SAIDA"));
    if (filtrados.length === 0) {
      modalBody.innerHTML = "<p>Não há registros.</p>";
    } else {
      modalBody.innerHTML = filtrados.map(m => `
        <div class="card" style="text-align:left; margin-bottom:10px;">
          <p><strong>Valor:</strong> R$ ${m.valor.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(m.createdAt).toLocaleString()}</p>
          <p><strong>Origem:</strong> ${m.ordem ? `OS #${m.ordem.id}` : "Gasto"}</p>
        </div>
      `).join("");
    }
  } catch (err) {
    modalBody.innerHTML = `<p>Erro ao carregar: ${err.message}</p>`;
  }
}

// Gera relatório Mensal ou Anual
async function gerarAndShowRelatorio(periodo, valor) {
  modalTitle.textContent = periodo === "mes"
    ? `Relatório Mensal: ${valor}`
    : `Relatório Anual: ${valor}`;
  modalBody.innerHTML = "<p>Gerando relatório...</p>";
  modal.style.display = "flex";
  try {
    const data = await gerarRelatorio(periodo, valor);
    modalBody.innerHTML = `
      <p><strong>Total Entradas:</strong> R$ ${data.totalEntradas.toFixed(2)}</p>
      <p><strong>Total Saídas:</strong> R$ ${data.totalSaidas.toFixed(2)}</p>
      <p><strong>Total Gastos:</strong> R$ ${data.totalGastos.toFixed(2)}</p>
      <p><strong>Total OS:</strong> ${data.totalOS}</p>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p>Erro ao gerar relatório: ${err.message}</p>`;
  }
}

// Listeners
cardEnt.addEventListener("click", () => showMovimentacoes("ENTRADA"));
cardSai.addEventListener("click", () => showMovimentacoes("SAIDA"));
cardPdf.addEventListener("click", () => document.getElementById("filtros").scrollIntoView());

btnMes.addEventListener("click", () => {
  if (!mesInput.value) return alert("Selecione um mês.");
  gerarAndShowRelatorio("mes", mesInput.value);
});
btnAno.addEventListener("click", () => {
  if (!anoInput.value || anoInput.value.length !== 4) return alert("Digite um ano válido (YYYY).");
  gerarAndShowRelatorio("ano", anoInput.value);
});
