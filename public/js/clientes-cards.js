// public/js/clientes-cards.js

import {
  getClientes,
  getClienteById,
  excluirCliente
} from "./api.js";

const cardsContainer = document.getElementById("cards-container");
const modal           = document.getElementById("modal");
const modalBody       = document.getElementById("modal-body");
const modalClose      = document.getElementById("modal-close");

/**
 * Carrega todos os clientes da API e renderiza como cards.
 */
async function loadClientes() {
  cardsContainer.innerHTML = ""; // limpa antes de preencher

  try {
    const clientes = await getClientes();
    if (!clientes || clientes.length === 0) {
      cardsContainer.innerHTML = `<p>Nenhum cliente cadastrado.</p>`;
      return;
    }

    clientes.forEach(cli => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h3>${cli.nome}</h3>
        <p><strong>Veículo:</strong> ${cli.veiculo}</p>
        <p><strong>Placa:</strong> ${cli.placa}</p>
      `;
      card.addEventListener("click", () => openModal(cli.id));
      cardsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
    cardsContainer.innerHTML = `<p style="color: red;">Não foi possível carregar a lista de clientes.</p>`;
  }
}

/**
 * Abre o modal exibindo todos os detalhes de um cliente.
 * Inclui botões de editar e excluir.
 * @param {number} idCliente 
 */
async function openModal(idCliente) {
  try {
    const cli = await getClienteById(idCliente);
    modalBody.innerHTML = `
      <h3>${cli.nome}</h3>
      <p><strong>Telefone:</strong> ${cli.telefone || "-"}</p>
      <p><strong>E-mail:</strong> ${cli.email || "-"}</p>
      <p><strong>Veículo:</strong> ${cli.veiculo}</p>
      <p><strong>Placa:</strong> ${cli.placa}</p>
      <p><strong>Criado Em:</strong> ${new Date(cli.criadoEm).toLocaleString()}</p>
      <div style="margin-top: 15px; text-align: right;">
        <button id="btn-editar">Editar</button>
        <button id="btn-excluir" style="margin-left:8px; background-color: #dc3545; color: #fff;">Excluir</button>
      </div>
    `;
    // Botão “Editar”: redireciona para cadastro em modo edição
    document.getElementById("btn-editar").addEventListener("click", () => {
      window.location.href = `/cadastro-cliente.html?edit=${cli.id}`;
    });
    // Botão “Excluir”: confirma e chama API para remover
    document.getElementById("btn-excluir").addEventListener("click", async () => {
      const confirma = confirm(`Deseja realmente excluir o cliente "${cli.nome}"?`);
      if (!confirma) return;
      try {
        await excluirCliente(cli.id);
        closeModal();
        await loadClientes();
      } catch (err) {
        alert(`Erro ao excluir: ${err.message}`);
      }
    });

    modal.style.display = "block";
  } catch (err) {
    console.error("Erro ao buscar detalhes do cliente:", err);
    alert("Não foi possível carregar os detalhes do cliente.");
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

// Fecha o modal ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Quando o DOM estiver pronto, carrega os clientes
document.addEventListener("DOMContentLoaded", loadClientes);
