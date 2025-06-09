// public/js/util/format.js

/**
 * Converte string BRL "1.234,56" → Number 1234.56
 */
export function parseBRL(str) {
  if (typeof str !== 'string') return 0;
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

/**
 * Formata número 1234.56 → string BRL "1.234,56"
 */
export function formatBRL(num) {
  if (typeof num !== 'number') num = parseFloat(num) || 0;
  return num
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
