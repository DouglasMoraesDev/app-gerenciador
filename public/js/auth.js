// Lógica de autenticação

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro no login");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.style.display = "block";
    }
  });
});