// Validações genéricas

export function validarEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

export function validarTelefone(tel) {
  // Exemplo simples, sem caracteres especiais
  const re = /^[0-9]{10,11}$/;
  return re.test(tel.replace(/\D/g, ''));
}

export function validarPlaca(placa) {
  // Ex: ABC1D23 ou ABC1234
  const re = /^[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}$/;
  return re.test(placa.toUpperCase());
}
