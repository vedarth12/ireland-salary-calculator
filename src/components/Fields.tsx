import type { ReactNode } from 'react'

interface NumberInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  placeholder?: string
  hint?: string
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
  min,
  placeholder,
  hint,
}: NumberInputProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="input-wrap">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          step={step}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: string
}

export function Select({ label, value, onChange, options, hint }: SelectProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

interface SegmentedProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function Segmented({ label, value, onChange, options }: SegmentedProps) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="segmented">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`segment${value === opt.value ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
  hint?: string
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = '%',
  hint,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="field">
      <div className="field-row">
        <span className="field-label">{label}</span>
        <span className="field-value">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--fill' as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      {(title || subtitle) && (
        <div className="card-head">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  tone?: 'default' | 'good' | 'bad' | 'accent'
  sub?: string
}

export function Stat({ label, value, tone = 'default', sub }: StatProps) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}
