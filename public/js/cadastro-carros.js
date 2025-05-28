import {
  getCarroById,
  criarCarro,
  atualizarCarro
} from "./api.js";

const form           = document.getElementById("carro-form");
const formTitle      = document.getElementById("form-title");
const inputId        = document.getElementById("carro-id");
const btnSubmit      = document.getElementById("submit-btn");
const btnCancelEdit  = document.getElementById("cancel-edit-btn");

const inputProps = {
  proprietario: document.getElementById("proprietario"),
  telefone:     document.getElementById("telefone"),
  email:        document.getElementById("email"),
  modelo:       document.getElementById("modelo"),
  placa:        document.getElementById("placa"),
};

// Lê ?edit=<id> da URL
function getEditId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("edit");
}

// Preenche o form se estiver em modo edição
async function populateForEdit(id) {
  try {
    const carro = await getCarroById(Number(id));
    formTitle.textContent = "Editar Carro";
    btnSubmit.textContent = "Atualizar";
    btnCancelEdit.style.display = "inline-block";
    inputId.value = carro.id;
    Object.keys(inputProps).forEach(key => {
      inputProps[key].value = carro[key] || "";
    });
  } catch {
    alert("Não foi possível carregar o carro para edição.");
  }
}

// Cancela edição e limpa o form
btnCancelEdit.addEventListener("click", () => {
  window.location.href = "/cadastro-carros.html";
});

// Submit do form (cadastrar ou atualizar)
form.addEventListener("submit", async e => {
  e.preventDefault();
  const dados = {
    proprietario: inputProps.proprietario.value.trim(),
    telefone:     inputProps.telefone.value.trim() || null,
    email:        inputProps.email.value.trim() || null,
    modelo:       inputProps.modelo.value.trim() || null,
    placa:        inputProps.placa.value.trim().toUpperCase()
  };

  try {
    if (inputId.value) {
      await atualizarCarro(Number(inputId.value), dados);
      alert("Carro atualizado com sucesso!");
    } else {
      await criarCarro(dados);
      alert("Carro cadastrado com sucesso!");
    }
    window.location.href = "/carros.html";
  } catch (err) {
    alert("Erro ao salvar: " + err.message);
  }
});

// Ao carregar, se houver edit, preenche
document.addEventListener("DOMContentLoaded", async () => {
  const editId = getEditId();
  if (editId) {
    await populateForEdit(editId);
  }
});
