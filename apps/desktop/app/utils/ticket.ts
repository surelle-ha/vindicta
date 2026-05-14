export function ticketKey(code: string, number: number): string {
  return `${code}-${number}`
}

export function deriveProjectCode(name: string): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '')
  return letters.slice(0, 3).padEnd(3, 'X')
}
