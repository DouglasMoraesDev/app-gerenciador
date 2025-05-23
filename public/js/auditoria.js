import { BASE_URL } from "./api.js";

const btn = document.getElementById("btn-auditar");
const inputMes = document.getElementById("mes");
const container = document.getElementById("relatorio");

btn.addEventListener("click", async () => {
  container.innerHTML = ""; // limpa antes
  const mes = inputMes.value;
  if (!mes) {
    alert("Selecione um mês.");
    return;
  }

  const resp = await fetch(`${BASE_URL}/api/auditoria?mes=${mes}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  if (resp.status === 401) {
    alert("Sessão expirada ou não autorizada. Faça login novamente.");
    window.location.href = "/login.html";
    return;
  }

  if (!resp.ok) {
    container.innerHTML = `<p>Erro ao gerar relatório: ${resp.statusText}</p>`;
    return;
  }

  const data = await resp.json();
  container.innerHTML = `
    <h3>Relatório de ${mes}</h3>
    <p>Entradas: R$ ${data.entradas.toFixed(2)}</p>
    <p>Saídas: R$ ${data.saidas.toFixed(2)}</p>
    <p>Ordens de Serviço emitidas: ${data.osCount}</p>
  `;
});
