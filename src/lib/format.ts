/**
 * Formata um número como moeda brasileira: R$ 00.000,00
 */
export function fmtBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata só o número sem o prefixo "R$": 00.000,00
 */
export function fmtNum(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
