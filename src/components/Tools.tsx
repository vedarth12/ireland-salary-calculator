import { useMemo, useState } from 'react'
import {
  calculateTax,
  getTaxYearConfig,
  standardRateBand,
  totalTaxCredits,
  type EmploymentType,
  type MaritalStatus,
} from '../lib/tax'
import { formatEUR, formatPercent, formatNumber, parseNumber } from '../lib/format'
import { Card, NumberInput, Select, Slider, Stat } from './Fields'
import Results from './Results'

const EMPLOYMENT_OPTIONS = [
  { value: 'employee', label: 'Employee (PAYE)' },
  { value: 'director', label: 'Company director' },
  { value: 'self-employed', label: 'Self-employed (Schedule D)' },
]

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'single-parent', label: 'Single parent' },
  { value: 'married-one', label: 'Married, one income' },
  { value: 'married-both', label: 'Married, two incomes' },
]

function useCommonSettings() {
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [marital, setMarital] = useState<MaritalStatus>('single')
  const [taxYear, setTaxYear] = useState('2025')
  return { employment, setEmployment, marital, setMarital, taxYear, setTaxYear }
}

export function CompareTool() {
  const common = useCommonSettings()
  const [salaryA, setSalaryA] = useState('42000')
  const [bonusA, setBonusA] = useState('')
  const [salaryB, setSalaryB] = useState('48000')
  const [bonusB, setBonusB] = useState('')
  const [pension, setPension] = useState(5)

  const a = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salaryA),
        bonusAnnual: parseNumber(bonusA),
        pensionPercent: pension,
        additionalCredits: 0,
        employment: common.employment,
        marital: common.marital,
        medicalCard: false,
        taxYear: Number(common.taxYear),
      }),
    [salaryA, bonusA, pension, common],
  )

  const b = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salaryB),
        bonusAnnual: parseNumber(bonusB),
        pensionPercent: pension,
        additionalCredits: 0,
        employment: common.employment,
        marital: common.marital,
        medicalCard: false,
        taxYear: Number(common.taxYear),
      }),
    [salaryB, bonusB, pension, common],
  )

  const diff = b.netAnnual - a.netAnnual

  return (
    <div className="tool-stack">
      <Card title="Compare salaries" subtitle="See how a pay increase actually affects take-home pay">
        <div className="compare-grid">
          <div className="compare-col">
            <h4 className="compare-head">Option A</h4>
            <NumberInput label="Annual salary" value={salaryA} onChange={setSalaryA} prefix="€" step={500} />
            <NumberInput label="Annual bonus" value={bonusA} onChange={setBonusA} prefix="€" step={500} />
          </div>
          <div className="compare-col">
            <h4 className="compare-head">Option B</h4>
            <NumberInput label="Annual salary" value={salaryB} onChange={setSalaryB} prefix="€" step={500} />
            <NumberInput label="Annual bonus" value={bonusB} onChange={setBonusB} prefix="€" step={500} />
          </div>
        </div>
        <div className="field-grid">
          <div className="span-half">
            <Slider label="Pension contribution" value={pension} onChange={setPension} min={0} max={40} />
          </div>
          <div className="span-half">
            <Select
              label="Employment type"
              value={common.employment}
              onChange={(v) => common.setEmployment(v as EmploymentType)}
              options={EMPLOYMENT_OPTIONS}
            />
          </div>
          <div className="span-half">
            <Select
              label="Marital status"
              value={common.marital}
              onChange={(v) => common.setMarital(v as MaritalStatus)}
              options={MARITAL_OPTIONS}
            />
          </div>
          <div className="span-half">
            <Select
              label="Tax year"
              value={common.taxYear}
              onChange={common.setTaxYear}
              options={[2024, 2025].map((y) => ({ value: String(y), label: `Tax year ${y}` }))}
            />
          </div>
        </div>
      </Card>

      <div className="compare-results">
        <div className="compare-slot">
          <Results result={a} showPension={pension > 0} />
        </div>
        <div className="compare-slot">
          <Results result={b} showPension={pension > 0} />
        </div>
      </div>

      <Card title="Bottom line">
        <div className="diff-row">
          <span>Difference in net pay per month</span>
          <span className={diff >= 0 ? 'diff-plus' : 'diff-minus'}>
            {diff >= 0 ? '+' : ''}
            {formatEUR(diff / 12, 0)} / month
          </span>
        </div>
        <div className="diff-row">
          <span>Difference in net pay per year</span>
          <span className={diff >= 0 ? 'diff-plus' : 'diff-minus'}>
            {diff >= 0 ? '+' : ''}
            {formatEUR(diff, 0)} / year
          </span>
        </div>
      </Card>
    </div>
  )
}

export function OvertimeTool() {
  const [salary, setSalary] = useState('42000')
  const [hours, setHours] = useState('39')
  const [overtime, setOvertime] = useState('5')
  const [multiplier, setMultiplier] = useState('1.5')
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [taxYear, setTaxYear] = useState('2025')

  const result = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salary),
        bonusAnnual: 0,
        pensionPercent: 0,
        additionalCredits: 0,
        employment,
        marital: 'single',
        medicalCard: false,
        taxYear: Number(taxYear),
      }),
    [salary, employment, taxYear],
  )

  const hourlyRate = parseNumber(hours) > 0 ? parseNumber(salary) / (52 * parseNumber(hours)) : 0
  const otRate = hourlyRate * parseNumber(multiplier)
  const grossOtWeekly = otRate * parseNumber(overtime)
  const grossOtAnnual = grossOtWeekly * 52
  const netOtAnnual = grossOtAnnual * (1 - result.marginalRate)
  const netOtWeekly = netOtAnnual / 52

  return (
    <div className="tool-stack">
      <Card title="Overtime calculator" subtitle="Work out the real pay for extra hours">
        <div className="field-grid">
          <div className="span-half">
            <NumberInput label="Annual salary" value={salary} onChange={setSalary} prefix="€" step={500} />
          </div>
          <div className="span-half">
            <NumberInput label="Contract hours / week" value={hours} onChange={setHours} step={1} />
          </div>
          <div className="span-half">
            <NumberInput
              label="Overtime hours / week"
              value={overtime}
              onChange={setOvertime}
              step={0.5}
            />
          </div>
          <div className="span-half">
            <Select
              label="Overtime rate"
              value={multiplier}
              onChange={setMultiplier}
              options={[
                { value: '1.25', label: '1.25x (Sunday/part-time)' },
                { value: '1.5', label: '1.5x (standard)' },
                { value: '2', label: '2x (double time)' },
              ]}
            />
          </div>
          <div className="span-half">
            <Select
              label="Employment type"
              value={employment}
              onChange={(v) => setEmployment(v as EmploymentType)}
              options={EMPLOYMENT_OPTIONS}
            />
          </div>
          <div className="span-half">
            <Select
              label="Tax year"
              value={taxYear}
              onChange={setTaxYear}
              options={[2024, 2025].map((y) => ({ value: String(y), label: `Tax year ${y}` }))}
            />
          </div>
        </div>
      </Card>

      <div className="stat-grid">
        <Stat label="Hourly rate (standard)" value={formatEUR(hourlyRate, 2)} />
        <Stat label="Overtime hourly rate" value={formatEUR(otRate, 2)} tone="accent" />
        <Stat label="Gross overtime / week" value={formatEUR(grossOtWeekly, 0)} />
        <Stat label="Gross overtime / year" value={formatEUR(grossOtAnnual, 0)} />
        <Stat label="Net overtime / week" value={formatEUR(netOtWeekly, 0)} tone="good" />
        <Stat label="Net overtime / year" value={formatEUR(netOtAnnual, 0)} tone="good" />
      </div>

      <Card title="How it works" subtitle={`Extra hours are taxed at your marginal rate (${formatPercent(result.marginalRate, 0)})`}>
        <p className="muted">
          Each extra euro from overtime is taxed at your top PAYE, USC and PRSI rates. Here you
          keep <strong>{formatPercent(1 - result.marginalRate, 0)}</strong> of every overtime euro
          earned — {formatEUR(netOtWeekly / Math.max(parseNumber(overtime), 1), 2)} net per
          overtime hour.
        </p>
      </Card>
    </div>
  )
}

export function BonusTool() {
  const [salary, setSalary] = useState('42000')
  const [bonus, setBonus] = useState('5000')
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [taxYear, setTaxYear] = useState('2025')

  const without = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salary),
        bonusAnnual: 0,
        pensionPercent: 0,
        additionalCredits: 0,
        employment,
        marital: 'single',
        medicalCard: false,
        taxYear: Number(taxYear),
      }),
    [salary, employment, taxYear],
  )

  const withBonus = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salary),
        bonusAnnual: parseNumber(bonus),
        pensionPercent: 0,
        additionalCredits: 0,
        employment,
        marital: 'single',
        medicalCard: false,
        taxYear: Number(taxYear),
      }),
    [salary, bonus, employment, taxYear],
  )

  const grossBonus = parseNumber(bonus)
  const taxOnBonus = grossBonus - (withBonus.netAnnual - without.netAnnual)
  const netBonus = withBonus.netAnnual - without.netAnnual

  return (
    <div className="tool-stack">
      <Card title="Bonus calculator" subtitle="How much of your bonus actually lands in your pocket">
        <div className="field-grid">
          <div className="span-half">
            <NumberInput label="Annual salary" value={salary} onChange={setSalary} prefix="€" step={500} />
          </div>
          <div className="span-half">
            <NumberInput label="Gross bonus" value={bonus} onChange={setBonus} prefix="€" step={100} />
          </div>
          <div className="span-half">
            <Select
              label="Employment type"
              value={employment}
              onChange={(v) => setEmployment(v as EmploymentType)}
              options={EMPLOYMENT_OPTIONS}
            />
          </div>
          <div className="span-half">
            <Select
              label="Tax year"
              value={taxYear}
              onChange={setTaxYear}
              options={[2024, 2025].map((y) => ({ value: String(y), label: `Tax year ${y}` }))}
            />
          </div>
        </div>
      </Card>

      <div className="stat-grid">
        <Stat label="Gross bonus" value={formatEUR(grossBonus, 0)} tone="accent" />
        <Stat label="Tax on bonus" value={`− ${formatEUR(taxOnBonus, 0)}`} tone="bad" />
        <Stat label="Net bonus" value={formatEUR(netBonus, 0)} tone="good" />
        <Stat label="Effective rate on bonus" value={formatPercent(grossBonus > 0 ? taxOnBonus / grossBonus : 0, 1)} />
      </div>

      <Card title="Breakdown" subtitle={`Bonus taxed at marginal rate ${formatPercent(withBonus.marginalRate, 0)}`}>
        <div className="detail-list">
          <div className="detail-row">
            <span>Income tax (PAYE)</span>
            <span>{formatEUR(withBonus.paye.amount - without.paye.amount, 0)}</span>
          </div>
          <div className="detail-row">
            <span>USC</span>
            <span>{formatEUR(withBonus.usc.amount - without.usc.amount, 0)}</span>
          </div>
          <div className="detail-row">
            <span>PRSI</span>
            <span>{formatEUR(withBonus.prsi.amount - without.prsi.amount, 0)}</span>
          </div>
          <div className="detail-row strong">
            <span>You keep</span>
            <span>{formatEUR(netBonus, 0)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function PensionTool() {
  const [salary, setSalary] = useState('42000')
  const [age, setAge] = useState('30')
  const [retirementAge, setRetirementAge] = useState('65')
  const [pension, setPension] = useState(10)
  const [salaryGrowth, setSalaryGrowth] = useState(2)
  const [growth, setGrowth] = useState(5)
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [taxYear, setTaxYear] = useState('2025')

  const result = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salary),
        bonusAnnual: 0,
        pensionPercent: pension,
        additionalCredits: 0,
        employment,
        marital: 'single',
        medicalCard: false,
        taxYear: Number(taxYear),
      }),
    [salary, pension, employment, taxYear],
  )

  const projection = useMemo(() => {
    const years = Math.max(0, parseNumber(retirementAge) - parseNumber(age))
    const monthlyReturn = growth / 100 / 12
    let balance = 0
    let annualContribution = parseNumber(salary) * (pension / 100)
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyReturn) + annualContribution / 12
      }
      annualContribution *= 1 + salaryGrowth / 100
    }
    return { balance, years, annualContribution }
  }, [salary, age, retirementAge, pension, salaryGrowth, growth])

  const annualRelief = result.pensionAnnual * result.marginalRate

  return (
    <div className="tool-stack">
      <Card title="Pension calculator" subtitle="Project your retirement pot and tax relief">
        <div className="field-grid">
          <div className="span-half">
            <NumberInput label="Current salary" value={salary} onChange={setSalary} prefix="€" step={500} />
          </div>
          <div className="span-half">
            <NumberInput label="Current age" value={age} onChange={setAge} step={1} />
          </div>
          <div className="span-half">
            <NumberInput label="Retirement age" value={retirementAge} onChange={setRetirementAge} step={1} />
          </div>
          <div className="span-half">
            <Slider label="Contribution" value={pension} onChange={setPension} min={0} max={40} />
          </div>
          <div className="span-half">
            <Slider label="Salary growth / year" value={salaryGrowth} onChange={setSalaryGrowth} min={0} max={8} />
          </div>
          <div className="span-half">
            <Slider label="Investment return / year" value={growth} onChange={setGrowth} min={0} max={10} />
          </div>
          <div className="span-half">
            <Select
              label="Employment type"
              value={employment}
              onChange={(v) => setEmployment(v as EmploymentType)}
              options={EMPLOYMENT_OPTIONS}
            />
          </div>
          <div className="span-half">
            <Select
              label="Tax year"
              value={taxYear}
              onChange={setTaxYear}
              options={[2024, 2025].map((y) => ({ value: String(y), label: `Tax year ${y}` }))}
            />
          </div>
        </div>
      </Card>

      <div className="stat-grid">
        <Stat label="Projected pension pot" value={formatEUR(projection.balance, 0)} tone="good" />
        <Stat label="Years contributing" value={String(projection.years)} />
        <Stat label="Annual tax relief today" value={formatEUR(annualRelief, 0)} tone="accent" />
        <Stat label="4% rule income / year" value={formatEUR(projection.balance * 0.04, 0)} />
        <Stat label="4% rule income / month" value={formatEUR((projection.balance * 0.04) / 12, 0)} />
        <Stat label="Final annual contribution" value={formatEUR(projection.annualContribution, 0)} />
      </div>

      <Card title="Tax relief" subtitle="Contributions are deducted before tax">
        <p className="muted">
          At your marginal rate of <strong>{formatPercent(result.marginalRate, 0)}</strong>, a{' '}
          <strong>{pension}%</strong> contribution on a €
          {formatNumber(parseNumber(salary))} salary gives you{' '}
          <strong>{formatEUR(annualRelief, 0)}</strong> back in tax each year. Over{' '}
          {projection.years} years that relief would total{' '}
          <strong>{formatEUR(annualRelief * projection.years, 0)}</strong> — effectively free
          money added to your pension.
        </p>
      </Card>

      <Card title="Note">
        <p className="muted">
          Projections assume contributions grow with salary inflation and returns compound monthly.
          {getTaxYearConfig(Number(taxYear)).year > 2024 &&
            ' This is an estimate only — investment returns are not guaranteed.'}
        </p>
      </Card>
    </div>
  )
}

export function PAYETool() {
  const [salary, setSalary] = useState('42000')
  const [bonus, setBonus] = useState('')
  const [pension, setPension] = useState(5)
  const [credits, setCredits] = useState('')
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [marital, setMarital] = useState<MaritalStatus>('single')
  const [taxYear, setTaxYear] = useState('2025')

  const result = useMemo(
    () =>
      calculateTax({
        salaryAnnual: parseNumber(salary),
        bonusAnnual: parseNumber(bonus),
        pensionPercent: pension,
        additionalCredits: parseNumber(credits),
        employment,
        marital,
        medicalCard: false,
        taxYear: Number(taxYear),
      }),
    [salary, bonus, pension, credits, employment, marital, taxYear],
  )

  const config = getTaxYearConfig(Number(taxYear))
  const band = standardRateBand(config, marital)
  const totalCredits = totalTaxCredits(config, employment, parseNumber(credits))
  const stdBandAmount = Math.min(result.taxableAnnual, band)
  const higherAmount = Math.max(0, result.taxableAnnual - band)
  const grossPaye = stdBandAmount * 0.2 + higherAmount * 0.4
  const personalCredit = config.taxCredits.personal
  const employeeCredit = employment === 'employee' || employment === 'director' ? config.taxCredits.employee : 0
  const additionalCredit = parseNumber(credits)

  return (
    <div className="tool-stack">
      <Card title="PAYE calculator" subtitle="Detailed breakdown of how your Income Tax (PAYE) is calculated">
        <div className="field-grid">
          <div className="span-half">
            <NumberInput label="Annual salary" value={salary} onChange={setSalary} prefix="€" step={500} />
          </div>
          <div className="span-half">
            <NumberInput label="Annual bonus" value={bonus} onChange={setBonus} prefix="€" step={100} />
          </div>
          <div className="span-half">
            <Slider label="Pension %" value={pension} onChange={setPension} min={0} max={40} />
          </div>
          <div className="span-half">
            <NumberInput label="Extra tax credits" value={credits} onChange={setCredits} prefix="€" step={50} />
          </div>
          <div className="span-half">
            <Select label="Employment type" value={employment} onChange={(v) => setEmployment(v as EmploymentType)} options={EMPLOYMENT_OPTIONS} />
          </div>
          <div className="span-half">
            <Select label="Marital status" value={marital} onChange={(v) => setMarital(v as MaritalStatus)} options={MARITAL_OPTIONS} />
          </div>
          <div className="span-half">
            <Select label="Tax year" value={taxYear} onChange={setTaxYear} options={[2024, 2025].map((y) => ({ value: String(y), label: `Tax year ${y}` }))} />
          </div>
        </div>
      </Card>

      <Card title="PAYE calculation steps">
        <div className="detail-list">
          <div className="detail-row">
            <span>Gross income (salary + bonus)</span>
            <span>{formatEUR(result.grossAnnual, 0)}</span>
          </div>
          <div className="detail-row">
            <span>Less: Pension contribution ({pension}%)</span>
            <span>− {formatEUR(result.pensionAnnual, 0)}</span>
          </div>
          <div className="detail-row strong">
            <span>Taxable income</span>
            <span>{formatEUR(result.taxableAnnual, 0)}</span>
          </div>
          <div className="detail-row">
            <span>Standard rate band (20%)</span>
            <span>{formatEUR(band, 0)}</span>
          </div>
          <div className="detail-row">
            <span>Tax at 20% on €{formatNumber(stdBandAmount, 0)}</span>
            <span>{formatEUR(stdBandAmount * 0.2, 0)}</span>
          </div>
          {higherAmount > 0 && (
            <>
              <div className="detail-row">
                <span>Higher rate band (40%)</span>
                <span>{formatEUR(higherAmount, 0)}</span>
              </div>
              <div className="detail-row">
                <span>Tax at 40% on €{formatNumber(higherAmount, 0)}</span>
                <span>{formatEUR(higherAmount * 0.4, 0)}</span>
              </div>
            </>
          )}
          <div className="detail-row strong">
            <span>Gross tax liability</span>
            <span>{formatEUR(grossPaye, 0)}</span>
          </div>
        </div>
      </Card>

      <Card title="Tax credits applied">
        <div className="detail-list">
          <div className="detail-row">
            <span>Personal tax credit</span>
            <span>{formatEUR(personalCredit, 0)}</span>
          </div>
          <div className="detail-row">
            <span>{employment === 'self-employed' ? 'Earned income credit' : 'Employee tax credit'}</span>
            <span>{formatEUR(employeeCredit, 0)}</span>
          </div>
          {additionalCredit > 0 && (
            <div className="detail-row">
              <span>Additional credits</span>
              <span>{formatEUR(additionalCredit, 0)}</span>
            </div>
          )}
          <div className="detail-row strong">
            <span>Total tax credits</span>
            <span>{formatEUR(totalCredits, 0)}</span>
          </div>
          <div className="detail-row strong">
            <span>Credits used (capped at gross tax)</span>
            <span>{formatEUR(result.creditsUsed, 0)}</span>
          </div>
          <div className="detail-row strong">
            <span>Net PAYE due</span>
            <span>{formatEUR(result.paye.amount, 0)}</span>
          </div>
        </div>
      </Card>

      <Card title="Summary">
        <div className="stat-grid">
          <Stat label="Gross PAYE liability" value={formatEUR(grossPaye, 0)} tone="bad" />
          <Stat label="Tax credits used" value={formatEUR(result.creditsUsed, 0)} tone="good" />
          <Stat label="Net PAYE (Income Tax)" value={formatEUR(result.paye.amount, 0)} />
          <Stat label="Effective PAYE rate" value={formatPercent(result.paye.amount / result.grossAnnual, 1)} tone="accent" />
        </div>
      </Card>
    </div>
  )
}