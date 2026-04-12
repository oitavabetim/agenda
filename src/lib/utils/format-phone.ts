/**
 * Formata número de telefone para o padrão brasileiro
 * (11) 99999-9999 (celular) ou (11) 9999-9999 (fixo)
 */
export function formatPhone(value: string): string {
  // Remove tudo que não é número
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  numbers = numbers.slice(0, 11);
  
  // Aplica formatação
  if (numbers.length <= 10) {
    // Telefone fixo: (11) 9999-9999
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // Telefone celular: (11) 99999-9999
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
}

/**
 * Remove formatação do telefone (deixa apenas números)
 * Útil para validações ou integrações que exigem apenas números
 */
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}
