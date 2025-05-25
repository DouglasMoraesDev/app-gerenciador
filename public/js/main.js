// Gerencia autenticação: checa token e logout

export function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
  }
}

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

    // Páginas protegidas (verificar token existente)
    const protectedPages = [
      "dashboard.html", "clientes.html", "servicos.html", 
      "os-list.html", "criar-os.html", "caixa.html", "gastos.html", "auditoria.html"
    ];
    const currentPage = window.location.pathname.split("/").pop();
    if (protectedPages.includes(currentPage)) {
      checkAuth();
    }
  });
}

// Auto-inicializa
initAuth();
