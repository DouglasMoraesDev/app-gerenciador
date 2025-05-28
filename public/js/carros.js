import {
  getCarros,
  excluirCarro
} from "./api.js";

const container = document.getElementById("carros-container");
let carrosCache = [];

// Renderiza todos os carros como cards
function renderCards(list) {
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p>Nenhum carro cadastrado.</p>";
    return;
  }

  list.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.placa} &nbsp; (${c.proprietario})</h3>
      <p><strong>Modelo:</strong> ${c.modelo || "-"}</p>
      <p><strong>Telefone:</strong> ${c.telefone || "-"}</p>
      <p><strong>Email:</strong> ${c.email || "-"}</p>
      <div style="margin-top:8px; text-align:right;">
        <a href="/cadastro-carros.html?edit=${c.id}">
          <button class="btn-edit">Editar</button>
        </a>
        <button class="btn-delete" data-id="${c.id}" style="margin-left:4px;">
          Excluir
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Vincula evento de exclusão para cada botão
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Deseja realmente excluir este carro?")) return;
      try {
        await excluirCarro(id);
        await loadCarros();
      } catch (err) {
        alert("Erro ao excluir carro: " + err.message);
      }
    });
  });
}

// Busca e exibe todos os carros
async function loadCarros() {
  container.innerHTML = "<p>Carregando...</p>";
  try {
    const list = await getCarros();
    carrosCache = list;
    renderCards(list);
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro ao buscar: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadCarros);
