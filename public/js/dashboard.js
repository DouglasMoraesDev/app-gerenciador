// dashboard.js
// Arquivo de script para a página de dashboard do Lava-Rápido

import {
  getOrdens,
  getCaixaAtual,
  getGastos,
  getCarros,    // Função correta para buscar a lista de clientes/carros
  getServicos
} from "./api.js";

// Aguarda o carregamento completo do DOM antes de executar
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar nome de usuário no cabeçalho
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

  // 2. Buscar dados em paralelo: ordens, caixa, gastos, carros (clientes), serviços
  const [ordens, caixa, gastos, carros, servicos] = await Promise.all([
    getOrdens(),      // busca ordens de serviço
    getCaixaAtual(),  // busca dados do caixa atual
    getGastos(),      // busca lista de gastos
    getCarros(),      // busca lista de clientes/carros
    getServicos()     // busca lista de serviços
  ]);

  // 3. Filtrar apenas as ordens do dia atual
  const hojeStr = new Date().toDateString();
  const ordensHoje = ordens.filter(o =>
    new Date(o.criadoEm).toDateString() === hojeStr
  );

  // 4. Calcular total de gastos do dia
  const gastosHoje = gastos
    .filter(g => new Date(g.data).toDateString() === hojeStr)
    .reduce((sum, g) => sum + g.valor, 0);

  // 5. Preparar dados para exibir nos cards do dashboard
  const cardsData = [
    { title: "Ordens Hoje",           value: ordensHoje.length },
    {
      title: "Saldo Atual Caixa",
      value: caixa
        ? `R$ ${(caixa.saldoInicial + caixa.entradas - caixa.saidas).toFixed(2)}`
        : "R$ 0,00"
    },
    { title: "Gastos Hoje",           value: `R$ ${gastosHoje.toFixed(2)}` },
    { title: "Carros Cadastrados",  value: carros.length },  // usa carros.length em vez de clientes.length
    { title: "Serviços Cadastrados",  value: servicos.length }
  ];

  // 6. Renderizar cards dinamicamente no container
  const container = document.getElementById("dash-cards");
  container.innerHTML = "";  // Limpa conteúdo anterior
  cardsData.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.title}</h3>
      <p style="font-size:1.5rem; margin-top:10px;">${c.value}</p>
    `;
    container.appendChild(card);
  });

  // 7. Criar gráfico de pizza para status das ordens de hoje usando Chart.js
  const ctx = document.getElementById("status-pie");
  const statusCounts = ordensHoje.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});
