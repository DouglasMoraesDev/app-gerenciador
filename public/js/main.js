// Funções globais de frontend

// Redireciona para a página de login caso não haja token
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

// Extrai nome do usuário do token (payload JWT) e exibe no dashboard
function getUserNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = atob(payloadBase64);
    const payload = JSON.parse(decoded);
    return payload.nome; // assume que o payload inclui { id, email, nome }
  } catch {
    return null;
  }
}

// Logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  // Em dashboard.html, exibe nome do usuário
  const userNameEl = document.getElementById("user-name");
  if (userNameEl) {
    const name = getUserNameFromToken();
    userNameEl.textContent = name || "Usuário";
  }

  // Em páginas protegidas, verifica autenticação
  const protectedPages = ["dashboard.html", "os.html", "caixa.html", "clientes.html"];
  const currentPage = window.location.pathname.split("/").pop();
  if (protectedPages.includes(currentPage)) {
    checkAuth();
  }
});