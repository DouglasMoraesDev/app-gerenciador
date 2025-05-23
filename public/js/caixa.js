// Controle de Caixa

async function getCaixaAtual() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/caixa/atual", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

async function abrirCaixa() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("/api/caixa/abrir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ saldoInicial: 0 }) // Exemplo: saldo inicial 0
    });
    if (!response.ok) throw new Error("Não foi possível abrir o caixa");
    renderCaixa();
  } catch (err) {
    alert(err.message);
  }
}

async function fecharCaixa() {
  const token = localStorage.getItem("token");
  try {
    const caixa = await getCaixaAtual();
    if (!caixa) return alert("Nenhum caixa aberto");
    const response = await fetch(`/api/caixa/fechar/${caixa.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Falha ao fechar o caixa");
    renderCaixa();
  } catch (err) {
    alert(err.message);
  }
}

async function fetchMovimentacoes() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/caixa/movimentacoes", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Não foi possível obter movimentações");
  return response.json();
}

async function renderMovimentacoes() {
  const tbody = document.querySelector("#mov-table tbody");
  tbody.innerHTML = "";
  try {
    const movs = await fetchMovimentacoes();
    movs.forEach((mov) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mov.tipo}</td>
        <td>R$ ${mov.valor.toFixed(2)}</td>
        <td>${new Date(mov.createdAt).toLocaleString()}</td>
        <td>${mov.usuario.nome}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

async function renderCaixa() {
  const abrirBtn = document.getElementById("abrir-caixa-btn");
  const fecharBtn = document.getElementById("fechar-caixa-btn");
  const saldoEl = document.getElementById("saldo-valor");

  const caixa = await getCaixaAtual();
  if (caixa) {
    abrirBtn.disabled = true;
    fecharBtn.disabled = false;
    saldoEl.textContent = `R$ ${caixa.entradas.toFixed(2)}`;
    renderMovimentacoes();
  } else {
    abrirBtn.disabled = false;
    fecharBtn.disabled = true;
    saldoEl.textContent = `R$ 0,00`;
    document.querySelector("#mov-table tbody").innerHTML = "";
  }
}

// Event listeners

document.addEventListener("DOMContentLoaded", () => {
  renderCaixa();
  document.getElementById("abrir-caixa-btn").addEventListener("click", abrirCaixa);
  document.getElementById("fechar-caixa-btn").addEventListener("click", fecharCaixa);
});