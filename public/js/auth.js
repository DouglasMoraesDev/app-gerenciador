// public/js/auth.js

import { BASE_URL, loginUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    try {
      const { token } = await loginUser(email, senha);
      localStorage.setItem("token", token);
      window.location.href = "https://app-gerenciador-production.up.railway.app/dashboard.html";
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.style.display = "block";
    }
  });
});
