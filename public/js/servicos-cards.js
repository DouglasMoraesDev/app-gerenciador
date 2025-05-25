// public/js/servicos-cards.js

import {
  getServicos,
  getServicoById,
  criarServico,
  atualizarServico,
  excluirServico
} from "./api.js";

const form = document.getElementById("servico-form");
const formTitle = document.getElementById("form-title");
const btnSubmit = document.getElementById("btn-submit");
const msgEl = document.getElementById("msg");
const cardsContainer = document.getElementById("servicos-cards");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

/**
 * Extrai o param ?edit=<id> da URL
 */
function getEditIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("edit"); // retorna string ou null
}

/**
 * Preenche o formulário com os dados de um serviço para edição.
 */
async function populateFormForEdit(editId) {
  try {
    const serv = await getServicoById(Number(editId));
    document.getElementById("nomeServ").value = serv.nome;
    document.getElementById("descricaoServ").value = serv.descricao;
    document.getElementById("valorServ").value = serv.valor.toFixed(2);
    formTitle.textContent = "Editar Serviço";
    btnSubmit.textContent = "Salvar Alterações";
    form.dataset.editId = editId;
  } catch (err) {
    console.error("Erro ao carregar serviço para edição:", err);
    msgEl.textContent = "Não foi possível carregar os dados do serviço.";
    msgEl.style.display = "block";
  }
}

/**
 * Carrega todos os serviços e renderiza como cards.
 */
async function loadServicos() {
  cardsContainer.innerHTML = ""; // limpa antes

  try {
    const servicos = await getServicos();
    if (!servicos || servicos.length === 0) {
      cardsContainer.innerHTML = `<p>Nenhum serviço cadastrado.</p>`;
      return;
    }

    servicos.forEach(serv => {
      const card = document.createElement("div");
      card.classList.add("card");
      // Exibe nome e valor, truncando a descrição (opcional)
      const descricaoCurta = serv.descricao.length > 60
        ? serv.descricao.slice(0, 57) + "..."
        : serv.descricao;

      card.innerHTML = `
        <h3>${serv.nome}</h3>
        <p>${descricaoCurta}</p>
        <p><strong>R$ ${serv.valor.toFixed(2)}</strong></p>
      `;
      card.addEventListener("click", () => openModal(serv.id));
      cardsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar serviços:", err);
    cardsContainer.innerHTML = `<p style="color:red;">Não foi possível carregar os serviços.</p>`;
  }
}

/**
 * Abre o modal exibindo todos os detalhes de um serviço.
 * Inclui botões de editar e excluir.
 * @param {number} idServico 
 */
async function openModal(idServico) {
  try {
    const serv = await getServicoById(idServico);
    const criadoEm = serv.criadoEm
      ? new Date(serv.criadoEm).toLocaleString()
      : "-";

    modalBody.innerHTML = `
      <h3>${serv.nome}</h3>
      <p><strong>Descrição:</strong> ${serv.descricao}</p>
      <p><strong>Valor:</strong> R$ ${serv.valor.toFixed(2)}</p>
      <p><strong>Criado Em:</strong> ${criadoEm}</p>
      <div style="margin-top: 15px; text-align: right;">
        <button id="btn-editar">Editar</button>
        <button id="btn-excluir" style="margin-left:8px; background-color: #dc3545; color: #fff;">Excluir</button>
      </div>
    `;
    // Botão “Editar”: redireciona para a página em modo edição
    document.getElementById("btn-editar").addEventListener("click", () => {
      window.location.href = `/servicos.html?edit=${serv.id}`;
    });
    // Botão “Excluir”: confirma e chama API para remover
    document.getElementById("btn-excluir").addEventListener("click", async () => {
      const confirma = confirm(`Deseja realmente excluir o serviço "${serv.nome}"?`);
      if (!confirma) return;
      try {
        await excluirServico(serv.id);
        closeModal();
        await loadServicos();
      } catch (err) {
        alert(`Erro ao excluir: ${err.message}`);
      }
    });

    modal.style.display = "block";
  } catch (err) {
    console.error("Erro ao buscar detalhes do serviço:", err);
    alert("Não foi possível carregar os detalhes do serviço.");
  }
}

/**
 * Fecha o modal.
 */
function closeModal() {
  modal.style.display = "none";
  modalBody.innerHTML = "";
}

// Fecha o modal ao clicar no “×”
modalClose.addEventListener("click", closeModal);

// Fecha ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Se houver ?edit=<id>, preenche formulário
  const editId = getEditIdFromURL();
  if (editId) {
    await populateFormForEdit(editId);
  }

  // 2. Carrega lista de serviços como cards
  await loadServicos();

  // 3. Trata submit do formulário (criar ou editar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.display = "none";
    msgEl.textContent = "";

    const dados = {
      nome: document.getElementById("nomeServ").value.trim(),
      descricao: document.getElementById("descricaoServ").value.trim(),
      valor: parseFloat(document.getElementById("valorServ").value),
    };

    try {
      if (form.dataset.editId) {
        await atualizarServico(Number(form.dataset.editId), dados);
        alert("Serviço atualizado com sucesso!");
      } else {
        await criarServico(dados);
        alert("Serviço cadastrado com sucesso!");
      }
      // Recarrega a página sem query string (limpa modo edição)
      window.location.href = "/servicos.html";
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.display = "block";
    }
  });
});
