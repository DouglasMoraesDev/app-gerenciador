// Gerenciamento de Ordens de Serviço

async function fetchOS() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/os", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Não foi possível carregar as OS");
  return response.json();
}

async function renderOSTable() {
  const tbody = document.querySelector("#os-table tbody");
  tbody.innerHTML = "";
  try {
    const ordens = await fetchOS();
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
  const token = localStorage.getItem("token");
  const clienteId = document.getElementById("clienteId").value;
  const descricao = document.getElementById("descricao").value;
  const valorTotal = parseFloat(document.getElementById("valorTotal").value);
  const osId = document.getElementById("os-form").dataset.editId;

  const payload = { clienteId: Number(clienteId), descricao, valorTotal };
  let url = "/api/os";
  let method = "POST";
  if (osId) {
    url += `/${osId}`;
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

    if (!response.ok) throw new Error("Falha ao salvar OS");
    document.getElementById("os-form").reset();
    delete document.getElementById("os-form").dataset.editId;
    renderOSTable();
  } catch (err) {
    alert(err.message);
  }
}

async function editOS(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/os/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return alert("OS não encontrada");
  const os = await response.json();
  document.getElementById("clienteId").value = os.clienteId;
  document.getElementById("descricao").value = os.descricao;
  document.getElementById("valorTotal").value = os.valorTotal;
  document.getElementById("os-form").dataset.editId = id;
}

async function deleteOS(id) {
  const confirma = confirm("Deseja realmente excluir essa OS?");
  if (!confirma) return;
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/os/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return alert("Falha ao excluir OS");
  renderOSTable();
}

// Event listeners

document.addEventListener("DOMContentLoaded", () => {
  // Carrega tabela de OS
  renderOSTable();
  // Listen no form
  document.getElementById("os-form").addEventListener("submit", createOrUpdateOS);
});