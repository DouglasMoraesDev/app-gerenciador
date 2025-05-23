document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const msgEl = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Pega valores do formulário
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    msgEl.style.display = "none";
    msgEl.textContent = "";

    // Pré-validações simples (você pode refinar depois)
    if (!nome || !email || !senha) {
      msgEl.textContent = "Preencha todos os campos.";
      msgEl.style.display = "block";
      return;
    }

    try {
      // POST /api/auth/register
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (response.status === 201) {
        // Cadastro OK. Redireciona para login
        window.location.href = "login.html";
      } else {
        // Lê mensagem de erro retornada pelo back-end
        const data = await response.json();
        msgEl.textContent = data.error || "Erro ao cadastrar.";
        msgEl.style.display = "block";
      }
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
      msgEl.textContent = "Erro de rede ou servidor.";
      msgEl.style.display = "block";
    }
  });
});
