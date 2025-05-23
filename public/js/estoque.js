import {
  BASE_URL
} from "./api.js";

// CRUD de produtos de estoque
const form = document.getElementById("produto-form");
const tbody = document.querySelector("#estoque-table tbody");

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

window.editProd = async id => {
  const p = await (await fetch(`${BASE_URL}/api/estoque/${id}`,{
    headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}
  })).json();
  document.getElementById("nomeProd").value = p.nome;
  document.getElementById("quantidade").value = p.quantidade;
  document.getElementById("validade").value = p.validade?.split("T")[0] || "";
  form.dataset.editId = id;
};

window.delProd = async id => {
  if (!confirm("Excluir produto?")) return;
  await fetch(`${BASE_URL}/api/estoque/${id}`, {
    method: "DELETE",
    headers: { Authorization:`Bearer ${localStorage.getItem("token")}` }
  });
  load();
};

form.addEventListener("submit", async e => {
  e.preventDefault();
  const dados = {
    nome: document.getElementById("nomeProd").value,
    quantidade: +document.getElementById("quantidade").value,
    validade: document.getElementById("validade").value || null
  };
  const id = form.dataset.editId;
  await fetch(`${BASE_URL}/api/estoque${id?"/"+id:""}`, {
    method: id ? "PUT" : "POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(dados)
  });
  form.reset();
  delete form.dataset.editId;
  load();
});

async function load() {
  const list = await fetchEstoque();
  renderEstoque(list);
}
load();
