// public/js/configuracao.js

import { BASE_URL } from "./api.js"; // Apenas BASE_URL é usado aqui

/* eslint-disable no-console */

const formUsuario      = document.getElementById("form-usuario");
const inputNomeUsr     = document.getElementById("usuario-nome");
const statusUsuario    = document.getElementById("status-usuario");

const formSenha        = document.getElementById("form-senha");
const inputSenhaAntiga = document.getElementById("senha-antiga");
const inputNovaSenha   = document.getElementById("nova-senha");
const inputConfirma    = document.getElementById("confirma-senha");
const statusSenha      = document.getElementById("status-senha");

const btnBackup        = document.getElementById("btn-fazer-backup");
const statusBackup     = document.getElementById("status-backup");

const inputRestore     = document.getElementById("input-restore");
const btnRestore       = document.getElementById("btn-restaurar-backup");
const statusRestore    = document.getElementById("status-restore");

// Ao carregar a página, busca os dados atuais do usuário (nome, etc.)
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }
    const resp = await fetch(`${BASE_URL}/api/usuario/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) throw new Error("Falha ao buscar dados do usuário.");
    const data = await resp.json();
    inputNomeUsr.value = data.nome;
  } catch (err) {
    console.error(err);
    statusUsuario.textContent = "Não foi possível carregar dados do perfil.";
    statusUsuario.style.color = "red";
  }
});

// === 1. Alterar nome de usuário ===
formUsuario.addEventListener("submit", async e => {
  e.preventDefault();
  statusUsuario.textContent = "";
  const novoNome = inputNomeUsr.value.trim();
  if (!novoNome) {
    statusUsuario.textContent = "O nome não pode ficar em branco.";
    statusUsuario.style.color = "red";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${BASE_URL}/api/usuario/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome: novoNome })
    });
    if (!resp.ok) {
      const errJson = await resp.json();
      throw new Error(errJson.error || "Erro ao atualizar nome.");
    }
    statusUsuario.textContent = "Nome atualizado com sucesso!";
    statusUsuario.style.color = "green";
  } catch (err) {
    console.error(err);
    statusUsuario.textContent = "Erro: " + err.message;
    statusUsuario.style.color = "red";
  }
});

// === 2. Alterar senha ===
formSenha.addEventListener("submit", async e => {
  e.preventDefault();
  statusSenha.textContent = "";

  const antiga = inputSenhaAntiga.value.trim();
  const nova    = inputNovaSenha.value.trim();
  const confirma = inputConfirma.value.trim();

  if (!antiga || !nova || !confirma) {
    statusSenha.textContent = "Preencha todos os campos.";
    statusSenha.style.color = "red";
    return;
  }
  if (nova !== confirma) {
    statusSenha.textContent = "A nova senha e a confirmação não conferem.";
    statusSenha.style.color = "red";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${BASE_URL}/api/usuario/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senhaAntiga: antiga,
        novaSenha: nova
      })
    });
    if (!resp.ok) {
      const errJson = await resp.json();
      throw new Error(errJson.error || "Erro ao alterar senha.");
    }
    statusSenha.textContent = "Senha alterada com sucesso!";
    statusSenha.style.color = "green";
    formSenha.reset();
  } catch (err) {
    console.error(err);
    statusSenha.textContent = "Erro: " + err.message;
    statusSenha.style.color = "red";
  }
});

// === 3. Fazer Backup ===
btnBackup.addEventListener("click", async () => {
  statusBackup.textContent = "Gerando backup...";
  statusBackup.style.color = "black";

  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${BASE_URL}/api/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) {
      let msg = "Falha ao gerar backup.";
      try {
        const errJson = await resp.json();
        msg = errJson.error || msg;
      } catch {}
      throw new Error(msg);
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const agora = new Date();
    const ts = `${agora.getFullYear()}${String(agora.getMonth()+1).padStart(2,"0")}${String(agora.getDate()).padStart(2,"0")}_${String(agora.getHours()).padStart(2,"0")}${String(agora.getMinutes()).padStart(2,"0")}`;
    a.download = `backup_${ts}.js`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    statusBackup.textContent = "Backup gerado com sucesso!";
    statusBackup.style.color = "green";
  } catch (err) {
    console.error(err);
    statusBackup.textContent = "Erro: " + err.message;
    statusBackup.style.color = "red";
  }
});

// === 4. Restaurar Backup ===
btnRestore.addEventListener("click", async () => {
  statusRestore.textContent = "";
  const file = inputRestore.files[0];
  if (!file) {
    statusRestore.textContent = "Selecione o arquivo de backup.";
    statusRestore.style.color = "red";
    return;
  }
  const formData = new FormData();
  formData.append("backupFile", file);

  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${BASE_URL}/api/backup/restore`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!resp.ok) {
      let msg = "Falha ao restaurar backup.";
      try {
        const errJson = await resp.json();
        msg = errJson.error || msg;
      } catch {}
      throw new Error(msg);
    }
    statusRestore.textContent = "Backup restaurado com sucesso!";
    statusRestore.style.color = "green";
    inputRestore.value = "";
  } catch (err) {
    console.error(err);
    statusRestore.textContent = "Erro: " + err.message;
    statusRestore.style.color = "red";
  }
});
