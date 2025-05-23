import { BASE_URL } from "./api.js";

document.getElementById("btn-auditar").addEventListener("click", async () => {
  const mes = document.getElementById("mes").value; // e.g. "2025-05"
  const resp = await fetch(`${BASE_URL}/api/auditoria?mes=${mes}`, {
    headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` }
  });
  const data = await resp.json();
  document.getElementById("relatorio").innerHTML = `
    <h3>${mes}</h3>
    <p>Entradas: R$ ${data.entradas.toFixed(2)}</p>
    <p>Saídas: R$ ${data.saidas.toFixed(2)}</p>
    <p>OS emitidas: ${data.osCount}</p>
    …
  `;
});
