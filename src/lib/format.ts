export function formatEUR(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatNumber(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatPercent(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`
}

export function parseNumber(value: string): number {
  const cleaned = value.replace(/[€\s,]/g, '')
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
