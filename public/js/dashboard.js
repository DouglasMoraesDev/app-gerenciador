// public/js/dashboard.js

import {
  getOrdens,
  getCaixaAtual,
  getGastos,
  getServicos
} from "./api.js";

// Agora importamos de public/js/util/format.js
import { formatBRL } from "./utils/format.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Exibe nome do usuário
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

  // 2) Busca dados em paralelo
  let ordens = [], caixa = null, gastos = [], servicos = [];
  try {
    [ordens, caixa, gastos, servicos] = await Promise.all([
      getOrdens(),
      getCaixaAtual().catch(() => null),
      getGastos(),
      getServicos()
    ]);
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
  }

  // 3) Filtra ORDENS DO DIA
  const hoje = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const ordensHoje = ordens.filter(o => o.criadoEm.slice(0, 10) === hoje);

  // 4) Filtra GASTOS DO DIA e soma
  const gastosHoje = gastos
    .filter(g => g.data.slice(0, 10) === hoje)
    .reduce((sum, g) => sum + g.valor, 0);

  // 5) Monta os cards (com redirecionamento ao clicar)
  const cardsData = [
    {
      title: "Ordens Hoje",
      value: ordensHoje.length,
      link: "/os-list.html"
    },
    {
      title: "Saldo Atual Caixa",
      value: caixa
        ? `R$ ${formatBRL(caixa.saldoInicial + caixa.entradas - caixa.saidas)}`
        : "R$ 0,00",
      link: "/caixa.html"
    },
    {
      title: "Gastos Hoje",
      value: `R$ ${formatBRL(gastosHoje)}`,
      link: "/gastos.html"
    },
    {
      title: "Serviços Cadastrados",
      value: servicos.length,
      link: null
    }
  ];

  const container = document.getElementById("dash-cards");
  container.innerHTML = "";

  cardsData.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.title}</h3>
      <p style="font-size:1.5rem; margin-top:10px;">${c.value}</p>
    `;
    if (c.link) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.href = c.link;
      });
    }
    container.appendChild(card);
  });

  // Nenhum gráfico aqui, pois foi removido.
});
