// public/js/clientes.js

import {
  getClientes,
  getClienteById,
  criarCliente,
  atualizarCliente,
  excluirCliente,
  BASE_URL,
} from "./api.js";

async function renderClientesTable() {
  const tbody = document.querySelector("#clientes-table tbody");
  tbody.innerHTML = "";
  try {
    const clientes = await getClientes();
    clientes.forEach((cli) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cli.id}</td>
        <td>${cli.nome}</td>
        <td>${cli.telefone || "-"}</td>
        <td>${cli.email || "-"}</td>
        <td>${cli.veiculo}</td>
        <td>${cli.placa}</td>
        <td>${new Date(cli.criadoEm).toLocaleString()}</td>
        <td>
          <button onclick="editCliente(${cli.id})">Editar</button>
          <button onclick="deleteCliente(${cli.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function createOrUpdateCliente(e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;
  const veiculo = document.getElementById("veiculo").value;
  const placa = document.getElementById("placa").value;
  const cliId = document.getElementById("cliente-form").dataset.editId;

  const dados = { nome, telefone, email, veiculo, placa };
  try {
    if (cliId) {
      await atualizarCliente(cliId, dados);
    } else {
      await criarCliente(dados);
    }
    document.getElementById("cliente-form").reset();
    delete document.getElementById("cliente-form").dataset.editId;
    renderClientesTable();
  } catch (err) {
    alert(err.message);
  }
}

window.editCliente = async function (id) {
  try {
    const cli = await getClienteById(id);
    document.getElementById("nome").value = cli.nome;
    document.getElementById("telefone").value = cli.telefone || "";
    document.getElementById("email").value = cli.email || "";
    document.getElementById("veiculo").value = cli.veiculo;
    document.getElementById("placa").value = cli.placa;
    document.getElementById("cliente-form").dataset.editId = id;
  } catch (err) {
    alert(err.message);
  }
};

window.deleteCliente = async function (id) {
  const confirma = confirm("Deseja realmente excluir este cliente?");
  if (!confirma) return;
  try {
    await excluirCliente(id);
    renderClientesTable();
  } catch (err) {
    alert(err.message);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderClientesTable();
  document.getElementById("cliente-form").addEventListener("submit", createOrUpdateCliente);
});
