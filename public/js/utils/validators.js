// Validações gerais: e-mail, telefone, placa

export function validarEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

export function validarTelefone(tel) {
  // Aceita apenas dígitos (10 ou 11 números)
  const re = /^[0-9]{10,11}$/;
  return re.test(tel.replace(/\D/g, ''));
}

export function validarPlaca(placa) {
  // Formato antigo (ABC1234) ou Mercosul (ABC1D23)
  const re = /^[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}$/;
  return re.test(placa.toUpperCase());
}
