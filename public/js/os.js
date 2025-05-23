// public/js/os.js

import {
  getOrdens,
  getOrdemById,
  criarOrdem,
  atualizarOrdem,
  excluirOrdem,
  BASE_URL,
} from "./api.js";

async function renderOSTable() {
  const tbody = document.querySelector("#os-table tbody");
  tbody.innerHTML = "";
  try {
    const ordens = await getOrdens();
    ordens.forEach((os) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${os.id}</td>
        <td>${os.cliente.nome}</td>
        <td>${os.descricao}</td>
        <td>${os.status}</td>
        <td>R$ ${os.valorTotal.toFixed(2)}</td>
        <td>${new Date(os.criadoEm).toLocaleString()}</td>
        <td>
          <button onclick="editOS(${os.id})">Editar</button>
          <button onclick="deleteOS(${os.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function createOrUpdateOS(e) {
  e.preventDefault();
  const clienteId = parseInt(document.getElementById("clienteId").value, 10);
  const descricao = document.getElementById("descricao").value.trim();
  const valorTotal = parseFloat(document.getElementById("valorTotal").value);
  const osId = document.getElementById("os-form").dataset.editId;

  const dados = { clienteId, descricao, valorTotal };
  try {
    if (osId) {
      await atualizarOrdem(osId, dados);
    } else {
      await criarOrdem(dados);
    }
    document.getElementById("os-form").reset();
    delete document.getElementById("os-form").dataset.editId;
    renderOSTable();
  } catch (err) {
    alert(err.message);
  }
}

window.editOS = async function (id) {
  try {
    const os = await getOrdemById(id);
    document.getElementById("clienteId").value = os.clienteId;
    document.getElementById("descricao").value = os.descricao;
    document.getElementById("valorTotal").value = os.valorTotal;
    document.getElementById("os-form").dataset.editId = id;
  } catch (err) {
    alert(err.message);
  }
};

window.deleteOS = async function (id) {
  if (!confirm("Deseja realmente excluir essa OS?")) return;
  try {
    await excluirOrdem(id);
    renderOSTable();
  } catch (err) {
    alert(err.message);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderOSTable();
  document.getElementById("os-form").addEventListener("submit", createOrUpdateOS);
});
