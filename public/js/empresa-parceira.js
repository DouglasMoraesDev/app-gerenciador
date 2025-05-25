import { getParceiras, criarParceira } from "./api.js";

const form            = document.getElementById("empresa-form");
const formTitle       = document.getElementById("form-title");
const submitBtn       = document.getElementById("submit-btn");
const cancelEditBtn   = document.getElementById("cancel-edit-btn");
const inputId         = document.getElementById("parceira-id");
const inputNome       = document.getElementById("nome");
const inputCnpj       = document.getElementById("cnpj");
const inputDescricao  = document.getElementById("descricao");
const inputValor      = document.getElementById("valorMensal");
const inputContrato   = document.getElementById("contrato");
const atualContrato   = document.getElementById("atual-contrato");

const container  = document.getElementById("parceiras-container");
const modal      = document.getElementById("modal");
const modalBody  = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

// Carrega e renderiza todos os parceiros
async function loadParceiras() {
  container.innerHTML = "";
  try {
    const list = await getParceiras();
    if (!list.length) {
      container.innerHTML = "<p>Nenhuma parceira cadastrada.</p>";
      return;
    }
    list.forEach(e => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${e.nome}</h3>
        <p><strong>CNPJ:</strong> ${e.cnpj}</p>
        <p><strong>Valor:</strong> R$ ${e.valorMensal.toFixed(2)}/mês</p>
      `;
      card.addEventListener("click", () => openModal(e));
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro ao buscar: ${err.message}</p>`;
  }
}

// Abre modal com todos os detalhes e ações de editar/excluir
function openModal(e) {
  modalBody.innerHTML = `
    <h3>${e.nome}</h3>
    <p><strong>CNPJ:</strong> ${e.cnpj}</p>
    <p><strong>Descrição:</strong><br/>${e.descricao}</p>
    <p><strong>Valor Mensal:</strong> R$ ${e.valorMensal.toFixed(2)}</p>
    <p><strong>Contrato:</strong> ${
      e.contratoUrl
        ? `<a href="${e.contratoUrl}" target="_blank">Abrir PDF</a>`
        : "Não enviado"
    }</p>
    <p><strong>Criado Em:</strong> ${new Date(e.criadoEm).toLocaleString()}</p>
    <div style="margin-top:15px; text-align:right;">
      <button id="btn-edit">Editar</button>
      <button id="btn-delete" style="margin-left:8px; background:#dc3545; color:#fff;">Excluir</button>
    </div>
  `;
  modal.style.display = "flex";

  document.getElementById("btn-edit").addEventListener("click", () => {
    startEdit(e);
    modal.style.display = "none";
  });
  document.getElementById("btn-delete").addEventListener("click", async () => {
    if (!confirm(`Excluir "${e.nome}"?`)) return;
    try {
      await fetch(`/api/parceiras/${e.id}`, { method: "DELETE" });
      loadParceiras();
      modal.style.display = "none";
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  });
}

// Inicia o modo de edição: preenche o formulário
function startEdit(e) {
  formTitle.textContent = "Editar Parceira";
  submitBtn.textContent = "Atualizar";
  cancelEditBtn.style.display = "inline-block";

  inputId.value        = e.id;
  inputNome.value      = e.nome;
  inputCnpj.value      = e.cnpj;
  inputDescricao.value = e.descricao;
  inputValor.value     = e.valorMensal;
  atualContrato.textContent = e.contratoUrl
    ? `Contrato atual: ${e.contratoUrl.split("/").pop()}`
    : "";
}

// Cancela o modo edição
cancelEditBtn.addEventListener("click", () => {
  formTitle.textContent = "Cadastrar Nova Parceira";
  submitBtn.textContent = "Salvar Parceira";
  cancelEditBtn.style.display = "none";
  inputId.value = "";
  form.reset();
  atualContrato.textContent = "";
});

// Trata submissão (criar ou atualizar)
form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = inputId.value;
  const data = new FormData(form);
  try {
    if (id) {
      // atualizar via PUT (inclua contrato só se trocou)
      const opts = {
        method: "PUT",
        body: JSON.stringify(Object.fromEntries(data.entries())),
        headers: { "Content-Type": "application/json" }
      };
      await fetch(`/api/parceiras/${id}`, opts);
      alert("Parceira atualizada!");
    } else {
      // criar via multipart
      await criarParceira(data);
      alert("Parceira cadastrada!");
    }
    cancelEditBtn.click();
    loadParceiras();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

modalClose.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", evt => {
  if (evt.target === modal) modal.style.display = "none";
});

document.addEventListener("DOMContentLoaded", loadParceiras);

import { getOSPorParceiro } from "./api.js"; // novo helper

container.querySelectorAll(".btn-relatorio")
  .forEach(btn => {
    btn.addEventListener("click", async () => {
      const parceiroId = btn.dataset.id;
      const mes = prompt("Mês (YYYY-MM):");
      if (!mes) return;
      const start = `${mes}-01`;
      const [y,m] = mes.split("-");
      const end = new Date(y, m, 0).toISOString().slice(0,10);

      const osList = await getOSPorParceiro(parceiroId, start, end);
      // usar jsPDF para gerar… (exemplo abaixo)
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(`Relatório OS de Parceiro #${parceiroId}`, 10, 20);
      let yPos = 30;
      osList.forEach((os,i) => {
        doc.text(
          `${i+1}. OS#${os.id} – ${os.cliente.nome} – ${os.servico.nome} – R$${os.valorServico.toFixed(2)}`,
          10, yPos
        );
        yPos += 8;
        if (yPos > 280) { doc.addPage(); yPos = 20; }
      });
      doc.save(`relatorio_parceiro_${parceiroId}_${mes}.pdf`);
    });
  });

