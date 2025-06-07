// public/js/empresa-parceira.js

import { getParceiras, criarParceira, getOSPorParceiro } from "./api.js";

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

/**
 * Carrega e renderiza todos os parceiros.
 * Para cada parceiro, inserimos:
 *  - um card com informações da parceira
 *  - um <input type="month"> para escolher mês/ano
 *  - botão "Gerar Relatório Mensal" com data-id e data-nome
 */
async function loadParceiras() {
  container.innerHTML = "";
  try {
    const list = await getParceiras();
    if (!list.length) {
      container.innerHTML = "<p>Nenhuma parceira cadastrada.</p>";
      return;
    }

    list.forEach(e => {
      // Criamos uma div.card com:
      // - informações da parceira
      // - um <input type="month"> para escolher mês/ano
      // - botão "Gerar Relatório Mensal" (agora com data-nome)
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
        <button 
          class="btn-relatorio" 
          data-id="${e.id}" 
          data-nome="${e.nome}" 
          style="margin-top:6px;"
        >
          Gerar Relatório Mensal
        </button>
        <button class="btn-detalhes" data-id="${e.id}" style="margin-top:6px; margin-left:8px;">
          Detalhes
        </button>
      `;
      container.appendChild(card);
    });

    // Detalhes: abre modal de edição/exclusão
    document.querySelectorAll(".btn-detalhes").forEach(btn => {
      btn.addEventListener("click", () => {
        const parceiroId = btn.dataset.id;
        const parceiro = list.find(p => p.id === Number(parceiroId));
        openModal(parceiro);
      });
    });

    // Botão Relatório: usa o <input type="month"> para pegar mês/ano e data-nome
    document.querySelectorAll(".btn-relatorio").forEach(btn => {
      btn.addEventListener("click", async () => {
        const parceiroId = btn.dataset.id;
        const parceiroNome = btn.dataset.nome; // pegamos o nome diretamente do data-nome
        const inputMonth = document.getElementById(`mes-relatorio-${parceiroId}`);
        const valorMonth = inputMonth.value; // ex: "2025-05"

        if (!valorMonth) {
          return alert("Selecione o mês/ano antes de gerar o relatório.");
        }

        const [ano, mes] = valorMonth.split("-");
        const start = `${ano}-${mes}-01`;
        const lastDay = new Date(Number(ano), Number(mes), 0).getDate();
        const diaFinal = String(lastDay).padStart(2, "0");
        const end = `${ano}-${mes}-${diaFinal}`;

        try {
          const osList = await getOSPorParceiro(parceiroId, start, end);
          if (!osList.length) {
            return alert("Nenhuma ordem de serviço encontrada para esse período.");
          }

          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();

          // Cabeçalho
          doc.setFontSize(14);
          doc.text("Relatório de Ordens de Serviço", 10, 20);
          doc.setFontSize(12);
          // Usamos parceiroNome em vez de buscar na lista
          doc.text(`Parceiro: ${parceiroNome}`, 10, 30);
          doc.text(`Período: ${start} até ${end}`, 10, 38);

          // Corpo do relatório, agora referenciando os.carro em vez de os.cliente
          let yPos = 50;
          osList.forEach((os, i) => {
            const carro = os.carro || {};   // CORREÇÃO: usar os.carro
            const servico = os.servico || {};

            // Primeira linha: número, OS#, cliente (proprietário), veículo (modelo) e placa
            const linha1 =
              `${i + 1}. OS#${os.id} – Cliente: ${carro.proprietario || 'N/A'} ` +
              `(Veículo: ${carro.modelo || 'N/A'} – Placa: ${carro.placa || 'N/A'})`;
            doc.text(linha1, 10, yPos);
            yPos += 8;

            // Segunda linha: serviço e valor
            const linha2 = `   Serviço: ${servico.nome || 'N/A'} – Valor: R$${os.valorServico.toFixed(2)}`;
            doc.text(linha2, 10, yPos);
            yPos += 10; // espaço extra antes da próxima OS

            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
          });

          doc.save(`relatorio_parceiro_${parceiroId}_${ano}${mes}.pdf`);
        } catch (err) {
          console.error("Erro ao gerar relatório:", err);
          alert("Erro ao gerar relatório: " + err.message);
        }
      });
    });

  } catch (err) {
    console.error("Erro ao buscar empresas parceiras:", err);
    container.innerHTML = `<p style="color:red;">Erro ao buscar: ${err.message}</p>`;
  }
}

/**
 * Abre modal com detalhes completos do parceiro
 */
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

/**
 * Inicia o modo de edição: preenche o formulário
 */
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
      // atualizar via PUT (sem upload de PDF)
      const opts = {
        method: "PUT",
        body: JSON.stringify(Object.fromEntries(data.entries())),
        headers: { "Content-Type": "application/json" }
      };
      await fetch(`/api/parceiras/${id}`, opts);
      alert("Parceira atualizada!");
    } else {
      // criar via multipart (FormData, permite upload de PDF)
      await criarParceira(data);
      alert("Parceira cadastrada!");
    }
    cancelEditBtn.click();
    loadParceiras();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", evt => {
  if (evt.target === modal) modal.style.display = "none";
});

document.addEventListener("DOMContentLoaded", loadParceiras);
