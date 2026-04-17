export const BRAZIL_TIMEZONE = "America/Sao_Paulo";
export const BRAZIL_UTC_OFFSET = "-03:00";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

function assertDateString(dateString: string) {
  if (!DATE_REGEX.test(dateString)) {
    throw new Error(`Data inválida: ${dateString}`);
  }
}

function assertTimeString(timeString: string) {
  if (!TIME_REGEX.test(timeString)) {
    throw new Error(`Horário inválido: ${timeString}`);
  }
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function getDateParts(dateString: string) {
  assertDateString(dateString);

  const [year, month, day] = dateString.split("-").map(Number);

  return { year, month, day };
}

function buildDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getBrazilFormatter(
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TIMEZONE,
    ...options,
  });
}

export function buildBrazilDateTime(
  dateString: string,
  timeString: string
): string {
  assertDateString(dateString);
  assertTimeString(timeString);

  return `${dateString}T${timeString}:00${BRAZIL_UTC_OFFSET}`;
}

export function getTodayInBrazilDateString(referenceDate = new Date()): string {
  const formatter = getBrazilFormatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(referenceDate);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Não foi possível obter a data atual no fuso do Brasil");
  }

  return `${year}-${month}-${day}`;
}

export function getDayOfWeekForDateString(dateString: string): number {
  const { year, month, day } = getDateParts(dateString);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDaysToDateString(
  dateString: string,
  daysToAdd: number
): string {
  const { year, month, day } = getDateParts(dateString);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + daysToAdd);

  return buildDateString(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

export function addMonthsToDateString(
  dateString: string,
  monthsToAdd: number
): string {
  const { year, month, day } = getDateParts(dateString);
  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, normalizedMonthIndex + 1, 0)
  ).getUTCDate();
  const targetDay = Math.min(day, lastDayOfTargetMonth);

  return buildDateString(targetYear, normalizedMonthIndex + 1, targetDay);
}

export function formatDateStringForDisplay(dateString: string): string {
  const { year, month, day } = getDateParts(dateString);

  return `${pad(day)}/${pad(month)}/${year}`;
}

export function extractDateFromDateTime(dateTimeString: string): string {
  const [dateString] = dateTimeString.split("T");
  assertDateString(dateString);
  return dateString;
}

export function formatEventDateForBrazil(dateTimeString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateTimeString));
}

export function formatEventTimeForBrazil(dateTimeString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateTimeString));
}

export function getBrazilDateStringFromDateTime(dateTimeString: string): string {
  const formatter = getBrazilFormatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(dateTimeString));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Não foi possível formatar a data ${dateTimeString}`);
  }

  return `${year}-${month}-${day}`;
}

export function getBrazilTimestamp(dateTimeString: string): number {
  return new Date(dateTimeString).getTime();
}
