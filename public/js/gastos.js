import { getCaixaAtual, getGastos, criarGasto, excluirGasto } from "./api.js";

const form = document.getElementById("gasto-form");
const container = document.getElementById("gastos-container");

async function loadGastos() {
  container.innerHTML = "";
  try {
    const gastos = await getGastos();
    gastos.forEach(g => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${g.categoria}</h3>
        <p>${g.descricao}</p>
        <p>R$ ${g.valor.toFixed(2)}</p>
        <p>${new Date(g.data).toLocaleDateString()}</p>
        <button>Excluir</button>
      `;
      card.querySelector("button").onclick = async () => {
        if (confirm("Excluir gasto?")) {
          await excluirGasto(g.id);
          loadGastos();
        }
      };
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar: ${err.message}</p>`;
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  // Verifica se há caixa aberto
  const caixa = await getCaixaAtual();
  if (!caixa) {
    return alert("Você precisa abrir o Caixa antes de registrar gastos.");
  }

  const categoria = form.categoria.value.trim();
  const descricao = form.descricao.value.trim();
  const valor     = parseFloat(form.valor.value);
  const data      = form.data.value;
  if (!categoria || !descricao || isNaN(valor) || valor <= 0) {
    return alert("Preencha todos os campos corretamente.");
  }

  try {
    await criarGasto({ categoria, descricao, valor, data });
    form.reset();
    loadGastos();
  } catch (err) {
    // Se for erro de Caixa não encontrado, já alertamos antes
    alert("Erro ao registrar gasto: " + err.message);
  }
});

document.addEventListener("DOMContentLoaded", loadGastos);
