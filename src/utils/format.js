// Funções de formatação de datas e moeda

export function formatarDataHora(date) {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
