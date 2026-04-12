/**
 * Utilitários de fuso horário para America/Sao_Paulo (UTC-3)
 */

/**
 * Cria data forçando fuso horário brasileiro (America/Sao_Paulo)
 * @param dateString Data no formato "YYYY-MM-DD"
 * @returns Date em UTC-3
 */
export function toDateInBrazil(dateString: string): Date {
  // Formato esperado: "2026-04-06"
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Cria data em UTC para evitar problemas de fuso
  // Adiciona 3 horas para compensar UTC-3
  const date = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
  
  // Ajusta para meia-noite UTC (que é 00:00 no Brasil)
  date.setUTCHours(0, 0, 0, 0);
  
  return date;
}

/**
 * Obtém data atual no fuso horário brasileiro
 * @returns Date atual em UTC-3
 */
export function getTodayInBrazil(): Date {
  const now = new Date();
  
  // Converte para UTC
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // Ajusta para UTC-3 (Brasil)
  const brazilOffset = 3 * 3600000; // 3 horas em milissegundos
  const brazilTime = new Date(utcTime - brazilOffset);
  
  return brazilTime;
}

/**
 * Obtém dia da semana no fuso brasileiro
 * @param date Data em UTC-3
 * @returns 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
 */
export function getDayInBrazil(date: Date): number {
  return date.getUTCDay();
}
