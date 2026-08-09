import type { CalculatorResult } from '../lib/tax'
import { formatEUR, formatPercent } from '../lib/format'
import { Card, Stat } from './Fields'

interface ResultsProps {
  result: CalculatorResult
  showPension?: boolean
}

export default function Results({ result, showPension = true }: ResultsProps) {
  const totalPct = result.grossAnnual > 0 ? 100 : 0
  const netPct = result.grossAnnual > 0 ? (result.netAnnual / result.grossAnnual) * 100 : 0
  const pensionPct =
    showPension && result.grossAnnual > 0 ? (result.pensionAnnual / result.grossAnnual) * 100 : 0
  const taxPct = totalPct - netPct - pensionPct

  const segs = [
    { label: 'Net pay', value: netPct, cls: 'net' },
    ...(showPension
      ? [{ label: 'Pension', value: pensionPct, cls: 'pension' }]
      : []),
    { label: 'Tax & PRSI', value: Math.max(0, taxPct), cls: 'tax' },
  ]

  return (
    <div className="results">
      <div className="hero">
        <span className="hero-label">Net monthly pay</span>
        <span className="hero-value">{formatEUR(result.netMonthly, 0)}</span>
        <span className="hero-sub">
          ≈ {formatEUR(result.netWeekly, 0)} per week · {formatPercent(result.effectiveRate, 1)}{' '}
          effective tax
        </span>
      </div>

      <div className="stat-grid">
        <Stat label="Gross monthly" value={formatEUR(result.grossMonthly, 0)} tone="accent" />
        <Stat label="PAYE (Income tax)" value={formatEUR(result.paye.amount, 0)} tone="bad" />
        <Stat label="USC" value={formatEUR(result.usc.amount, 0)} tone="bad" />
        <Stat label="PRSI" value={formatEUR(result.prsi.amount, 0)} tone="bad" />
        <Stat label="Net weekly" value={formatEUR(result.netWeekly, 0)} tone="good" />
        <Stat label="Effective tax rate" value={formatPercent(result.effectiveRate, 1)} />
      </div>

      <Card title="Where your salary goes" subtitle={`Based on €${result.grossAnnual.toLocaleString()} gross annual`}>
        <div className="stack-bar">
          {segs.map((seg) => (
            <div
              key={seg.label}
              className={`stack-seg ${seg.cls}`}
              style={{ width: `${seg.value}%` }}
              title={`${seg.label}: ${seg.value.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="stack-legend">
          {segs.map((seg) => (
            <div key={seg.label} className="legend-item">
              <span className={`legend-dot ${seg.cls}`} />
              <span>
                {seg.label} · {seg.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Breakdown details">
        <div className="detail-list">
          <DetailRow label="Gross annual" value={formatEUR(result.grossAnnual, 0)} />
          {showPension && (
            <DetailRow label="Pension (annual)" value={`− ${formatEUR(result.pensionAnnual, 0)}`} />
          )}
          <DetailRow label="Standard rate band (20%)" value={formatEUR(result.standardBand, 0)} />
          <DetailRow label="Tax credits used" value={formatEUR(result.creditsUsed, 0)} />
          <DetailRow label="PAYE paid" value={`− ${formatEUR(result.paye.amount, 0)}`} />
          <DetailRow label="USC paid" value={`− ${formatEUR(result.usc.amount, 0)}`} />
          <DetailRow label="PRSI paid" value={`− ${formatEUR(result.prsi.amount, 0)}`} />
          <DetailRow label="Net annual" value={formatEUR(result.netAnnual, 0)} strong />
          <DetailRow label="Marginal tax rate" value={formatPercent(result.marginalRate, 0)} />
        </div>
      </Card>
    </div>
  )
}

function DetailRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`detail-row${strong ? ' strong' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
