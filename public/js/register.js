// public/js/register.js

import { BASE_URL, registerUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const msgEl = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    msgEl.style.display = "none";
    msgEl.textContent = "";

    try {
      await registerUser({ nome, email, senha });
      window.location.href = "/login.html";

    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.display = "block";
    }
  });
});
