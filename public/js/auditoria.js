// public/js/auditoria.js

import { getMovimentacoesRange } from "./api.js";
import { formatBRL } from "./utils/format.js";

const startEl  = document.getElementById("start-date");
const endEl    = document.getElementById("end-date");
const btnGen   = document.getElementById("btn-gerar");
const modal    = document.getElementById("audit-modal");
const closeBtn = document.getElementById("audit-close");
const bodyEl   = document.getElementById("audit-body");
const titleEl  = document.getElementById("audit-title");
const btnPdf   = document.getElementById("btn-pdf");

let currentData = [];
let currentSaldoInicial = 0;
const { jsPDF } = window.jspdf;

closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

btnGen.addEventListener("click", async () => {
  const start = startEl.value;
  const end   = endEl.value;
  if (!start || !end) return alert("Selecione data de início e fim.");
  if (start > end) return alert("Data início deve ser ≤ data fim.");

  titleEl.textContent = `De ${start} até ${end}`;
  bodyEl.innerHTML = "<p>Carregando...</p>";
  modal.style.display = "flex";

  try {
    // AGORA recebe saldoInicial + movimentacoes
    const { saldoInicial, movimentacoes } = await getMovimentacoesRange(start, end);
    currentSaldoInicial = saldoInicial;
    currentData = movimentacoes;

    // Calcula totais
    let totIn = 0, totOut = 0;
    movimentacoes.forEach(m => {
      if (m.tipo === "ENTRADA") totIn += m.valor;
      else if (m.tipo === "SAIDA") totOut += m.valor;
    });
    const saldoFinal = saldoInicial + totIn - totOut;

    // Monta HTML do resumo
    bodyEl.innerHTML = `
      <div style="margin-bottom:12px;">
        <p><strong>Saldo Inicial:</strong> <strong>R$ ${formatBRL(saldoInicial)}</strong></p>
        <p><strong>Total Entradas:</strong> <strong>R$ ${formatBRL(totIn)}</strong></p>
        <p><strong>Total Saídas:</strong> <strong>R$ ${formatBRL(totOut)}</strong></p>
        <p><strong>Saldo Final:</strong> <strong>R$ ${formatBRL(saldoFinal)}</strong></p>
      </div>
      ${movimentacoes.map((m, i) => {
        const val = formatBRL(m.valor);
        const dt  = new Date(m.createdAt).toLocaleString();
        const origem = m.ordem
          ? `OS #${m.ordem.id} (${m.ordem.descricaoServico})`
          : m.gasto
            ? `Gasto (${m.gasto.descricao})`
            : "-";
        return `
          <div style="border-bottom:1px solid #ccc; padding:8px 0;">
            <p><strong>${m.tipo}:</strong> R$ ${val}</p>
            <p><strong>Data:</strong> ${dt}</p>
            <p><strong>Usuário:</strong> ${m.usuario.nome}</p>
            <p><strong>Origem:</strong> ${origem}</p>
          </div>
        `;
      }).join("")}
    `;
  } catch (err) {
    bodyEl.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }
});

// A lógica de gerar PDF permanece igual, usando currentSaldoInicial em vez de buscar o caixa atual
btnPdf.addEventListener("click", () => {
  if (!currentData.length) return alert("Nenhuma movimentação para exportar.");

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titleEl.textContent, 10, 20);

  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text(`Saldo Inicial: R$ ${formatBRL(currentSaldoInicial)}`, 10, 30);

  // ... (restante igual, usando currentSaldoInicial para o primeiro valor)

  doc.save(`auditoria_${startEl.value}_${endEl.value}.pdf`);
});
