/**
 * Helpers genéricos de geração de dados de teste.
 * Evita massa fixa que causaria conflito entre execuções (ex: obras
 * com o mesmo nome, e-mails de convite duplicados).
 */

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function futureDateISO(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD (formato do <input type="date">)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function randomCep(): string {
  const n = () => Math.floor(Math.random() * 10)
  return `0${n()}${n()}${n()}${n()}-${n()}${n()}${n()}`
}
