import { BASE_URL } from "./api.js";

const form = document.getElementById("empresa-form");
const tbody = document.querySelector("#empresa-table tbody");

// Busca e rendeiriza lista
async function loadParceiras() {
  const resp = await fetch(`${BASE_URL}/api/empresasParceiras`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!resp.ok) return;
  const list = await resp.json();
  tbody.innerHTML = "";
  list.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.id}</td>
      <td>${e.nome}</td>
      <td>${e.cnpj}</td>
      <td>${e.descricao}</td>
      <td>R$ ${e.valorMensal.toFixed(2)}</td>
      <td>
        ${e.contratoUrl 
          ? `<a href="${e.contratoUrl}" target="_blank">Ver contrato</a>` 
          : "-"}
      </td>`;
    tbody.appendChild(tr);
  });
}

// Envio do formulário
form.addEventListener("submit", async e => {
  e.preventDefault();
  const data = new FormData();
  data.append("nome",        form.nome.value.trim());
  data.append("cnpj",        form.cnpj.value.trim());
  data.append("descricao",   form.descricao.value.trim());
  data.append("valorMensal", form.valorMensal.value);
  data.append("contrato",    form.contrato.files[0]);

  const resp = await fetch(`${BASE_URL}/api/empresasParceiras`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: data
  });

  if (resp.status === 401) {
    alert("Sessão expirada. Faça login novamente.");
    return window.location.href = "/login.html";
  }
  if (!resp.ok) {
    const err = await resp.json();
    return alert(`Erro: ${err.error || resp.statusText}`);
  }

  alert("Empresa parceira cadastrada!");
  form.reset();
  await loadParceiras();
});

document.addEventListener("DOMContentLoaded", loadParceiras);
