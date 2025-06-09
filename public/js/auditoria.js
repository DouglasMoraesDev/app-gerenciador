// public/js/auditoria.js

import { getMovimentacoesRange, getCaixaAtual } from "./api.js";
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
let currentCaixa = null;

const { jsPDF } = window.jspdf;  // pega global após CDN

// Fecha modal
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Gera e exibe relatório
btnGen.addEventListener("click", async () => {
  const start = startEl.value;
  const end   = endEl.value;
  if (!start || !end) {
    return alert("Selecione data de início e fim.");
  }
  if (start > end) {
    return alert("A data início deve ser ≤ data fim.");
  }

  titleEl.textContent = `De ${start} até ${end}`;
  bodyEl.innerHTML = "<p>Carregando...</p>";
  modal.style.display = "flex";

  try {
    // Busca movimentações no intervalo
    const data = await getMovimentacoesRange(start, end);
    currentData = data;

    // Busca caixa atual para obter saldoInicial
    try {
      currentCaixa = await getCaixaAtual();
    } catch {
      currentCaixa = null;
    }
    const saldoInicial = currentCaixa ? currentCaixa.saldoInicial : 0;

    // Calcula totais de entradas e saídas
    let totalEntradas = 0;
    let totalSaidas = 0;
    data.forEach(m => {
      if (m.tipo === "ENTRADA") totalEntradas += m.valor;
      else if (m.tipo === "SAIDA") totalSaidas += m.valor;
    });
    const saldoFinal = saldoInicial + totalEntradas - totalSaidas;

    if (!data.length) {
      bodyEl.innerHTML = "<p>Nenhuma movimentação neste período.</p>";
      return;
    }

    // Monta HTML com resumo e lista detalhada
    const resumoHtml = `
      <div style="margin-bottom: 12px;">
        <p><strong>Saldo Inicial:</strong> R$ ${formatBRL(saldoInicial)}</p>
        <p><strong>Total Entradas:</strong> R$ ${formatBRL(totalEntradas)}</p>
        <p><strong>Total Saídas:</strong> R$ ${formatBRL(totalSaidas)}</p>
        <p><strong>Saldo Final:</strong> R$ ${formatBRL(saldoFinal)}</p>
      </div>
    `;

    const listaHtml = data.map((m, i) => {
      const valorStr = formatBRL(m.valor);
      const dataStr  = new Date(m.createdAt).toLocaleString();
      const origem   = m.ordem
        ? `OS #${m.ordem.id} (${m.ordem.descricaoServico})`
        : m.gasto
          ? `Gasto (${m.gasto.descricao})`
          : "-";
      return `
        <div style="border-bottom:1px solid #ccc; padding:8px 0;">
          <p><strong>${m.tipo}:</strong> R$ ${valorStr}</p>
          <p><strong>Data:</strong> ${dataStr}</p>
          <p><strong>Usuário:</strong> ${m.usuario.nome}</p>
          <p><strong>Origem:</strong> ${origem}</p>
        </div>
      `;
    }).join("");

    bodyEl.innerHTML = resumoHtml + listaHtml;
  } catch (err) {
    bodyEl.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }
});

// Exporta PDF via jsPDF, incluindo resumo completo
btnPdf.addEventListener("click", async () => {
  if (!currentData.length) {
    return alert("Nenhuma movimentação para exportar.");
  }

  // Busca caixa atual para obter saldoInicial (se não buscado antes)
  if (currentCaixa === null) {
    try {
      currentCaixa = await getCaixaAtual();
    } catch {
      currentCaixa = null;
    }
  }
  const saldoInicial = currentCaixa ? currentCaixa.saldoInicial : 0;

  // Calcula totais
  let totalEntradas = 0;
  let totalSaidas = 0;
  currentData.forEach(m => {
    if (m.tipo === "ENTRADA") totalEntradas += m.valor;
    else if (m.tipo === "SAIDA") totalSaidas += m.valor;
  });
  const saldoFinal = saldoInicial + totalEntradas - totalSaidas;

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titleEl.textContent, 10, 20);

  doc.setFontSize(12);
  doc.text(`Saldo Inicial: R$ ${formatBRL(saldoInicial)}`, 10, 30);
  doc.text(`Total Entradas: R$ ${formatBRL(totalEntradas)}`, 10, 38);
  doc.text(`Total Saídas: R$ ${formatBRL(totalSaidas)}`, 10, 46);
  doc.text(`Saldo Final: R$ ${formatBRL(saldoFinal)}`, 10, 54);

  doc.setFontSize(10);
  let y = 66;
  currentData.forEach((m, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const valorStr = formatBRL(m.valor);
    const dataStr  = new Date(m.createdAt).toLocaleString();
    doc.text(
      `${i + 1}. [${m.tipo}] R$ ${valorStr} - ${dataStr}`,
      10, y
    );
    y += 6;
    const origem = m.ordem
      ? `OS #${m.ordem.id}: ${m.ordem.descricaoServico}`
      : m.gasto
        ? `Gasto: ${m.gasto.descricao}`
        : "";
    if (origem) {
      doc.text(origem, 14, y);
      y += 8;
    } else {
      y += 2;
    }
  });

  doc.save(`auditoria_${startEl.value}_${endEl.value}.pdf`);
});
