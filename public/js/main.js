// public/js/main.js

// Redireciona para a página de login caso não haja token
export function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
  }
}

// Extrai nome do usuário do token (payload JWT)
export function getUserNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = atob(payloadBase64);
    const payload = JSON.parse(decoded);
    return payload.nome || null;
  } catch {
    return null;
  }
}

// Configura logout e, em páginas protegidas, chama checkAuth
export function initAuth() {
  document.addEventListener("DOMContentLoaded", () => {
    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      });
    }

    // Em páginas protegidas, verifica autenticação
    const protectedPages = ["dashboard.html", "os.html", "caixa.html", "clientes.html"];
    const currentPage = window.location.pathname.split("/").pop();
    if (protectedPages.includes(currentPage)) {
      checkAuth();
    }
  });
}

// Chama initAuth automaticamente se este script for importado
initAuth();
