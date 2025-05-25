// public/js/cadastro-cliente.js

import {
  getClienteById,
  criarCliente,
  atualizarCliente
} from "./api.js";

const form = document.getElementById("cad-cliente-form");
const formTitle = document.getElementById("form-title");
const msgEl = document.getElementById("msg");
const btnSubmit = document.getElementById("btn-submit");

// Função para extrair query param ?edit=<id>
function getEditIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("edit"); // retorna string ou null
}

async function populateFormForEdit(editId) {
  try {
    const cli = await getClienteById(Number(editId));
    document.getElementById("nome").value = cli.nome;
    document.getElementById("telefone").value = cli.telefone || "";
    document.getElementById("email").value = cli.email || "";
    document.getElementById("veiculo").value = cli.veiculo;
    document.getElementById("placa").value = cli.placa;
    // Atualiza título e botão
    formTitle.textContent = "Editar Cliente";
    btnSubmit.textContent = "Salvar Alterações";
    form.dataset.editId = editId;
  } catch (err) {
    console.error("Erro ao carregar cliente para edição:", err);
    msgEl.textContent = "Não foi possível carregar os dados do cliente.";
    msgEl.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const editId = getEditIdFromURL();
  if (editId) {
    await populateFormForEdit(editId);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.display = "none";
    msgEl.textContent = "";

    const dados = {
      nome:     form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      email:    form.email.value.trim(),
      veiculo:  form.veiculo.value.trim(),
      placa:    form.placa.value.trim().toUpperCase()
    };

    try {
      if (form.dataset.editId) {
        // Modo edição
        await atualizarCliente(Number(form.dataset.editId), dados);
        alert("Cliente atualizado com sucesso!");
      } else {
        // Modo criação
        await criarCliente(dados);
        alert("Cliente cadastrado com sucesso!");
      }
      window.location.href = "/clientes.html";
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.display = "block";
    }
  });
});
