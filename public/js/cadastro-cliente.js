import { criarCliente } from "./api.js";
const form = document.getElementById("cad-cliente-form");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const dados = {
    nome: form.nome.value,
    telefone: form.telefone.value,
    email: form.email.value,
    veiculo: form.veiculo.value,
    placa: form.placa.value
  };
  try {
    await criarCliente(dados);
    alert("Cliente cadastrado!");
    form.reset();
  } catch (err) {
    alert(err.message);
  }
});
