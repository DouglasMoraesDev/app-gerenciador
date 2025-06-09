import {
  getOrdens,
  getCaixaAtual,
  getGastos,
  getServicos
} from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Exibe nome do usuário
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      document.getElementById("user-name").textContent = payload.nome || "Usuário";
    } catch {
      document.getElementById("user-name").textContent = "Usuário";
    }
  } else {
    document.getElementById("user-name").textContent = "Visitante";
  }

  // Busca dados em paralelo (sem getCarros)
  const [ordens, caixa, gastos, servicos] = await Promise.all([
    getOrdens(),
    getCaixaAtual(),
    getGastos(),
    getServicos()
  ]);

  // Filtra ordens e gastos do dia
  const hojeStr = new Date().toDateString();
  const ordensHoje = ordens.filter(o =>
    new Date(o.criadoEm).toDateString() === hojeStr
  );
  const gastosHoje = gastos
    .filter(g => new Date(g.data).toDateString() === hojeStr)
    .reduce((sum, g) => sum + g.valor, 0);

  // Prepara cards (tirado “Carros Cadastrados”)
  const cardsData = [
    { title: "Ordens Hoje", value: ordensHoje.length },
    {
      title: "Saldo Atual Caixa",
      value: caixa
        ? `R$ ${(caixa.saldoInicial + caixa.entradas - caixa.saidas).toFixed(2)}`
        : "R$ 0,00"
    },
    { title: "Gastos Hoje", value: `R$ ${gastosHoje.toFixed(2)}` },
    { title: "Serviços Cadastrados", value: servicos.length }
  ];

  // Renderiza cards
  const container = document.getElementById("dash-cards");
  container.innerHTML = "";
  cardsData.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.title}</h3>
      <p style="font-size:1.5rem; margin-top:10px;">${c.value}</p>
    `;
    container.appendChild(card);
  });

  // Gráfico de pizza
  const ctx = document.getElementById("status-pie");
  const statusCounts = ordensHoje.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{ data: Object.values(statusCounts) }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
});
