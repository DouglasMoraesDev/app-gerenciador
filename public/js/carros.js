import {
  getCarros,
  criarCarro,
  atualizarCarro,
  excluirCarro
} from "./api.js";

const form              = document.getElementById("carro-form");
const formTitle         = document.getElementById("form-title");
const submitBtn         = document.getElementById("submit-btn");
const cancelEditBtn     = document.getElementById("cancel-edit-btn");
const inputId           = document.getElementById("carro-id");
const inputProprietario = document.getElementById("proprietario");
const inputTelefone     = document.getElementById("telefone");
const inputEmail        = document.getElementById("email");
const inputModelo       = document.getElementById("modelo");
const inputPlaca        = document.getElementById("placa");

const container  = document.getElementById("carros-container");
const modal      = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const btnNovo    = document.getElementById("btn-novo-carro");

let carrosCache = []; // cache local das informações

// --- 1) Abrir modal em branco (modo “cadastrar”) ---
btnNovo.addEventListener("click", () => {
  formTitle.textContent = "Cadastrar Novo Carro";
  submitBtn.textContent = "Salvar Carro";
  cancelEditBtn.style.display = "none";
  inputId.value = "";
  form.reset();
  modal.style.display = "flex";
});

// --- 2) Fecha o modal ao clicar no “×” ---
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fecha se clicar fora do conteúdo
modal.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// --- 3) Inicia o modo de edição: preenche o formulário ---
function startEdit(car) {
  formTitle.textContent = "Editar Carro";
  submitBtn.textContent = "Atualizar";
  cancelEditBtn.style.display = "inline-block";

  inputId.value           = car.id;
  inputProprietario.value = car.proprietario;
  inputTelefone.value     = car.telefone || "";
  inputEmail.value        = car.email || "";
  inputModelo.value       = car.modelo || "";
  inputPlaca.value        = car.placa;

  modal.style.display = "flex";
}

// --- 4) Cancela o modo edição: volta para “cadastrar” ---
cancelEditBtn.addEventListener("click", () => {
  formTitle.textContent = "Cadastrar Novo Carro";
  submitBtn.textContent = "Salvar Carro";
  cancelEditBtn.style.display = "none";
  inputId.value = "";
  form.reset();
});

// --- 5) Renderiza todos os carros como cards ---
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
        <button class="btn-edit" data-id="${c.id}">Editar</button>
        <button class="btn-delete" data-id="${c.id}" style="margin-left:4px; background:#dc3545; color:#fff;">Excluir</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Vincula eventos de edição/exclusão para cada card recém‐criado
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const car = carrosCache.find(x => x.id === id);
      if (car) startEdit(car);
    });
  });

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

// --- 6) Faz a requisição GET /api/carros e atualiza a tela ---
async function loadCarros() {
  container.innerHTML = "<p>Carregando...</p>";
  try {
    const list = await getCarros();
    carrosCache = list;  // atualiza cache local
    renderCards(list);
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro ao buscar: ${err.message}</p>`;
  }
}

// --- 7) Tratamento do formulário (criar ou atualizar) ---
form.addEventListener("submit", async e => {
  e.preventDefault();

  // Validações mínimas
  const proprietario = inputProprietario.value.trim();
  const placa        = inputPlaca.value.trim().toUpperCase();

  if (!proprietario) {
    return alert("O campo Proprietário é obrigatório.");
  }
  if (!placa) {
    return alert("O campo Placa é obrigatório.");
  }

  const dados = {
    proprietario,
    telefone: inputTelefone.value.trim() || null,
    email:    inputEmail.value.trim() || null,
    modelo:   inputModelo.value.trim() || null,
    placa
  };

  try {
    if (inputId.value) {
      // Modo edição
      await atualizarCarro(Number(inputId.value), dados);
      alert("Carro atualizado com sucesso!");
    } else {
      // Modo criação
      await criarCarro(dados);
      alert("Carro cadastrado com sucesso!");
    }

    // Fecha modal e recarrega a lista
    modal.style.display = "none";
    await loadCarros();
  } catch (err) {
    alert("Erro ao salvar carro: " + err.message);
  }
});

// --- 8) Ao carregar a página, busca e exibe todos os carros ---
document.addEventListener("DOMContentLoaded", loadCarros);
