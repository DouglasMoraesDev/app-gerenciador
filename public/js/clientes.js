// CRUD de Clientes

async function fetchClientes() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/clientes", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Não foi possível carregar clientes");
  return response.json();
}

async function renderClientesTable() {
  const tbody = document.querySelector("#clientes-table tbody");
  tbody.innerHTML = "";
  try {
    const clientes = await fetchClientes();
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
  const token = localStorage.getItem("token");
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;
  const veiculo = document.getElementById("veiculo").value;
  const placa = document.getElementById("placa").value;
  const cliId = document.getElementById("cliente-form").dataset.editId;

  const payload = { nome, telefone, email, veiculo, placa };
  let url = "/api/clientes";
  let method = "POST";
  if (cliId) {
    url += `/${cliId}`;
    method = "PUT";
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Falha ao salvar cliente");
    document.getElementById("cliente-form").reset();
    delete document.getElementById("cliente-form").dataset.editId;
    renderClientesTable();
  } catch (err) {
    alert(err.message);
  }
}

async function editCliente(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/clientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return alert("Cliente não encontrado");
  const cli = await response.json();
  document.getElementById("nome").value = cli.nome;
  document.getElementById("telefone").value = cli.telefone || "";
  document.getElementById("email").value = cli.email || "";
  document.getElementById("veiculo").value = cli.veiculo;
  document.getElementById("placa").value = cli.placa;
  document.getElementById("cliente-form").dataset.editId = id;
}

async function deleteCliente(id) {
  const confirma = confirm("Deseja realmente excluir este cliente?");
  if (!confirma) return;
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/clientes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return alert("Falha ao excluir cliente");
  renderClientesTable();
}

// Event listeners

document.addEventListener("DOMContentLoaded", () => {
  renderClientesTable();
  document.getElementById("cliente-form").addEventListener("submit", createOrUpdateCliente);
});