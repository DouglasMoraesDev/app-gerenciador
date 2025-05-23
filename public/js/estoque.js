import { BASE_URL } from "./api.js";

const form = document.getElementById("produto-form");
const tbody = document.querySelector("#estoque-table tbody");
const inputSearch = document.getElementById("search-estoque");

let estoqueList = [];      // guarda todos os produtos para filtro

async function fetchEstoque() {
  const resp = await fetch(`${BASE_URL}/api/estoque`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return resp.ok ? resp.json() : [];
}

function renderEstoque(list) {
  tbody.innerHTML = "";
  list.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.quantidade}</td>
      <td>${p.validade ? new Date(p.validade).toLocaleDateString() : "-"}</td>
      <td>
        <button onclick="editProd(${p.id})">Editar</button>
        <button onclick="delProd(${p.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// filtra pelo nome do produto
inputSearch.addEventListener("input", () => {
  const term = inputSearch.value.trim().toLowerCase();
  const filtered = estoqueList.filter(p =>
    p.nome.toLowerCase().includes(term)
  );
  renderEstoque(filtered);
});

window.editProd = async id => {
  const resp = await fetch(`${BASE_URL}/api/estoque/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  const p = await resp.json();
  form.nome.value = p.nome;
  form.quantidade.value = p.quantidade;
  form.validade.value = p.validade?.split("T")[0] || "";
  form.dataset.editId = id;
};

window.delProd = async id => {
  if (!confirm("Excluir produto?")) return;
  await fetch(`${BASE_URL}/api/estoque/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  await load();
};

form.addEventListener("submit", async e => {
  e.preventDefault();
  const dados = {
    nome: form.nome.value.trim(),
    quantidade: Number(form.quantidade.value),
    validade: form.validade.value || null
  };
  const id = form.dataset.editId;
  await fetch(`${BASE_URL}/api/estoque${id ? "/" + id : ""}`, {
    method: id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(dados)
  });
  form.reset();
  delete form.dataset.editId;
  await load();
});

async function load() {
  estoqueList = await fetchEstoque();
  renderEstoque(estoqueList);
}

load();
