import { criarCliente } from "./api.js";

const form = document.getElementById("cad-cliente-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome:     form.nome.value.trim(),
    telefone: form.telefone.value.trim(),
    email:    form.email.value.trim(),
    veiculo:  form.veiculo.value.trim(),
    placa:    form.placa.value.trim().toUpperCase()
  };

  try {
    await criarCliente(dados);
    alert("Cliente cadastrado com sucesso!");
    form.reset();
    // opcional: redirecionar para lista de clientes
    // window.location.href = "/clientes.html";
  } catch (err) {
    alert(`Erro ao cadastrar cliente: ${err.message}`);
  }
});
