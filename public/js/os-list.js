import {
  getOrdens,
  changeStatus,
  BASE_URL
} from "./api.js";

const tbody = document.querySelector("#os-table tbody");
const filtro = document.getElementById("filtroStatus");
let ordens = [];

// Renderiza a tabela com filtragem
function renderTable(list) {
  tbody.innerHTML = "";
  list.forEach(os => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${os.id}</td>
      <td>${os.cliente.nome}</td>
      <td>${os.descricao}</td>
      <td>
        <select data-id="${os.id}" class="status-select">
          <option${os.status==="PENDENTE"?" selected":""} value="PENDENTE">Pendente</option>
          <option${os.status==="EM_ANDAMENTO"?" selected":""} value="EM_ANDAMENTO">Em Andamento</option>
          <option${os.status==="PRONTO"?" selected":""} value="PRONTO">Pronto</option>
          <option${os.status==="ENTREGUE"?" selected":""} value="ENTREGUE">Entregue</option>
        </select>
      </td>
      <td>R$ ${os.valorTotal.toFixed(2)}</td>
      <td>${new Date(os.criadoEm).toLocaleString()}</td>
      <td>
        <button data-action="refresh" data-id="${os.id}">🔄</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // vincula handlers nos selects
  document.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", onStatusChange);
  });
  // botões refresh
  document.querySelectorAll("button[data-action=refresh]").forEach(btn => {
    btn.addEventListener("click", load);
  });
}

// Quando muda status
async function onStatusChange(e) {
  const id = Number(e.target.dataset.id);
  const novoStatus = e.target.value;
  try {
    await changeStatus(id, novoStatus);
    alert(`Status da OS #${id} alterado para ${novoStatus}`);
  } catch (err) {
    alert(`Erro ao alterar status: ${err.message}`);
  }
}

// Carrega as ordens do dia (filtra por data de hoje)
async function load() {
  const todas = await getOrdens();
  // filtra somente ordens criadas hoje
  const hoje = new Date().toDateString();
  ordens = todas.filter(os => new Date(os.criadoEm).toDateString() === hoje);
  // aplica filtro de status
  const statusFiltro = filtro.value;
  const list = statusFiltro ? ordens.filter(o => o.status === statusFiltro) : ordens;
  renderTable(list);
}

filtro.addEventListener("change", load);
document.addEventListener("DOMContentLoaded", load);
