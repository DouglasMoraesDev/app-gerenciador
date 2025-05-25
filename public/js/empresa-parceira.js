import { getParceiras, criarParceira } from "./api.js";

const form = document.getElementById("empresa-form");
const container = document.getElementById("parceiras-container");

async function loadParceiras() {
  container.innerHTML = "";
  try {
    const list = await getParceiras();
    list.forEach(e => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${e.nome}</h3>
        <p><strong>CNPJ:</strong> ${e.cnpj}</p>
        <p>${e.descricao}</p>
        <p><strong>Valor:</strong> R$ ${e.valorMensal.toFixed(2)}/mês</p>
        <p>${e.contratoUrl
          ? `<a href="${e.contratoUrl}" target="_blank">Ver Contrato</a>`
          : "Sem contrato"}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p>Erro ao buscar: ${err.message}</p>`;
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const data = new FormData(form);
  try {
    await criarParceira(data);
    alert("Parceira cadastrada!");
    form.reset();
    loadParceiras();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

document.addEventListener("DOMContentLoaded", loadParceiras);
