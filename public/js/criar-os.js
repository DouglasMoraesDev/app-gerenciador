import { BASE_URL, getClientes, criarOrdem } from "./api.js";

const form = document.getElementById("criar-os-form");
const clienteSelect = document.getElementById("clienteId");

// Carrega lista de clientes para o select
async function loadClientes() {
  const clientes = await getClientes();
  clienteSelect.innerHTML = `<option value="">-- selecione --</option>`;
  clientes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nome} (${c.veiculo} - ${c.placa})`;
    clienteSelect.appendChild(opt);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const dados = {
    clienteId: Number(form.clienteId.value),
    descricao: form.descricao.value.trim(),
    valorTotal: parseFloat(form.valorTotal.value),
    status: form.status.value
  };
  try {
    await criarOrdem(dados);
    alert("Ordem criada com sucesso!");
    form.reset();
  } catch (err) {
    alert(`Erro ao criar ordem: ${err.message}`);
  }
});

document.addEventListener("DOMContentLoaded", loadClientes);
