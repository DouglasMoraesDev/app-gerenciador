// public/js/empresa-parceira.js

import {
  getParceiras,
  criarParceira,
  atualizarParceira,
  deletarParceira,
  getOSPorParceiro
} from "./api.js";

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
        <div class="relatorio-controls" style="margin-top:8px;">
          <label for="mes-relatorio-${e.id}" style="font-size:0.9rem;">Mês/Ano:</label>
          <input type="month" id="mes-relatorio-${e.id}" name="mes-relatorio-${e.id}" style="margin-left:4px;" />
        </div>
        <button class="btn-relatorio" data-id="${e.id}" data-nome="${e.nome}" style="margin-top:6px;">
          Gerar Relatório Mensal
        </button>
        <button class="btn-detalhes" data-id="${e.id}" style="margin-top:6px; margin-left:8px;">
          Detalhes
        </button>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".btn-detalhes").forEach(btn => {
      btn.addEventListener("click", () => {
        const parceiroId = Number(btn.dataset.id);
        const parceiro = list.find(p => p.id === parceiroId);
        openModal(parceiro);
      });
    });

    document.querySelectorAll(".btn-relatorio").forEach(btn => {
      btn.addEventListener("click", async () => {
        const parceiroId = btn.dataset.id;
        const parceiroNome = btn.dataset.nome;
        const inputMonth = document.getElementById(`mes-relatorio-${parceiroId}`);
        const valorMonth = inputMonth.value;
        if (!valorMonth) return alert("Selecione o mês/ano antes.");
        const [ano, mes] = valorMonth.split("-");
        const start = `${ano}-${mes}-01`;
        const lastDay = new Date(Number(ano), Number(mes), 0).getDate();
        const end = `${ano}-${mes}-${String(lastDay).padStart(2,"0")}`;
        const osList = await getOSPorParceiro(parceiroId, start, end);
        if (!osList.length) return alert("Nenhuma OS nesse período.");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Relatório de Ordens de Serviço", 10, 20);
        doc.setFontSize(12);
        doc.text(`Parceiro: ${parceiroNome}`, 10, 30);
        doc.text(`Período: ${start} até ${end}`, 10, 38);
        let yPos = 50;
        osList.forEach((os, i) => {
          const linha1 = `${i+1}. OS#${os.id} – Cliente: ${os.carro.proprietario} (Veículo: ${os.carro.modelo} – Placa: ${os.carro.placa})`;
          doc.text(linha1, 10, yPos); yPos += 8;
          const linha2 = `   Serviço: ${os.servico.nome} – Valor: R$${os.valorServico.toFixed(2)}`;
          doc.text(linha2, 10, yPos); yPos += 10;
          if (yPos > 280) { doc.addPage(); yPos = 20; }
        });
        doc.save(`relatorio_parceiro_${parceiroId}_${ano}${mes}.pdf`);
      });
    });

  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }
}

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
    <div style="text-align:right; margin-top:15px;">
      <button id="btn-edit">Editar</button>
      <button id="btn-delete" style="margin-left:8px; background:#dc3545; color:#fff;">Excluir</button>
    </div>
  `;
  modal.style.display = "flex";

  document.getElementById("btn-edit").onclick = () => {
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
    modal.style.display = "none";
  };

  document.getElementById("btn-delete").onclick = async () => {
    if (!confirm(`Excluir "${e.nome}"?`)) return;
    await deletarParceira(e.id);
    modal.style.display = "none";
    loadParceiras();
  };
}

cancelEditBtn.onclick = () => {
  formTitle.textContent = "Cadastrar Nova Parceira";
  submitBtn.textContent = "Salvar Parceira";
  cancelEditBtn.style.display = "none";
  inputId.value = "";
  form.reset();
  atualContrato.textContent = "";
};

form.onsubmit = async e => {
  e.preventDefault();
  const id = inputId.value;
  const data = new FormData(form);
  if (id) {
    // atualização
    const obj = Object.fromEntries(data.entries());
    await atualizarParceira(id, obj);
    alert("Parceira atualizada!");
  } else {
    // criação
    await criarParceira(data);
    alert("Parceira cadastrada!");
  }
  cancelEditBtn.click();
  loadParceiras();
};

modalClose.onclick = () => modal.style.display = "none";
window.addEventListener("click", evt => {
  if (evt.target === modal) modal.style.display = "none";
});

document.addEventListener("DOMContentLoaded", loadParceiras);
