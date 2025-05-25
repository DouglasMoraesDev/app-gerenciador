// public/js/auditoria.js

import { getMovimentacoesRange } from "./api.js";

const startEl  = document.getElementById("start-date");
const endEl    = document.getElementById("end-date");
const btnGen   = document.getElementById("btn-gerar");
const modal    = document.getElementById("audit-modal");
const closeBtn = document.getElementById("audit-close");
const bodyEl   = document.getElementById("audit-body");
const titleEl  = document.getElementById("audit-title");
const btnPdf   = document.getElementById("btn-pdf");

let currentData = [];

const { jsPDF } = window.jspdf;  // pega global após CDN

// Fecha modal
closeBtn.addEventListener("click", ()=> modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Gera e exibe relatório
btnGen.addEventListener("click", async ()=>{
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
    const data = await getMovimentacoesRange(start, end);
    currentData = data;
    if (!data.length) {
      bodyEl.innerHTML = "<p>Nenhuma movimentação neste período.</p>";
    } else {
      bodyEl.innerHTML = data.map((m,i) => `
        <div style="border-bottom:1px solid #ccc; padding:8px 0;">
          <p><strong>${m.tipo}:</strong> R$ ${m.valor.toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(m.createdAt).toLocaleString()}</p>
          <p><strong>Usuário:</strong> ${m.usuario.nome}</p>
          <p><strong>Origem:</strong>
            ${m.ordem
              ? `OS #${m.ordem.id} (${m.ordem.descricaoServico})`
              : m.gasto
                ? `Gasto (${m.gasto.descricao})`
                : "-"}
          </p>
        </div>
      `).join("");
    }
  } catch (err) {
    bodyEl.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }
});

// Exporta PDF via jsPDF
btnPdf.addEventListener("click", ()=>{
  if (!currentData.length) {
    return alert("Nenhuma movimentação para exportar.");
  }
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titleEl.textContent, 10, 20);
  doc.setFontSize(10);

  let y = 30;
  currentData.forEach((m,i)=>{
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${i+1}. [${m.tipo}] R$${m.valor.toFixed(2)} - ${new Date(m.createdAt).toLocaleString()}`,
      10, y
    );
    y += 6;
    const origem = m.ordem
      ? `OS #${m.ordem.id}: ${m.ordem.descricaoServico}`
      : m.gasto
        ? `Gasto: ${m.gasto.descricao}`
        : "";
    doc.text(origem, 14, y);
    y += 8;
  });

  doc.save(`auditoria_${startEl.value}_${endEl.value}.pdf`);
});
