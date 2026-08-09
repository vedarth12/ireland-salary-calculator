import { useMemo, useState } from 'react'
import {
  calculateTax,
  TAX_YEARS,
  type EmploymentType,
  type MaritalStatus,
  type Period,
} from '../lib/tax'
import { parseNumber } from '../lib/format'
import { Card, NumberInput, Segmented, Select, Slider, Toggle } from './Fields'
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

export default function Calculator() {
  const [salary, setSalary] = useState('50000')
  const [period, setPeriod] = useState<Period>('annual')
  const [bonus, setBonus] = useState('')
  const [pension, setPension] = useState(5)
  const [credits, setCredits] = useState('')
  const [employment, setEmployment] = useState<EmploymentType>('employee')
  const [marital, setMarital] = useState<MaritalStatus>('single')
  const [medicalCard, setMedicalCard] = useState(false)
  const [taxYear, setTaxYear] = useState<string>('2025')

  const result = useMemo(() => {
    const salaryAnnual =
      period === 'monthly' ? parseNumber(salary) * 12 : parseNumber(salary)
    return calculateTax({
      salaryAnnual,
      bonusAnnual: parseNumber(bonus),
      pensionPercent: pension,
      additionalCredits: parseNumber(credits),
      employment,
      marital,
      medicalCard,
      taxYear: Number(taxYear),
    })
  }, [salary, period, bonus, pension, credits, employment, marital, medicalCard, taxYear])

  // Compute standard credits for display
  const config = TAX_YEARS[Number(taxYear)] ?? TAX_YEARS[2025]
  const personalCredit = config.taxCredits.personal
  const employeeCredit = (employment === 'employee' || employment === 'director') ? config.taxCredits.employee : 0
  const standardCredits = personalCredit + employeeCredit
  const totalCredits = standardCredits + parseNumber(credits)

  return (
    <div className="calculator-grid">
      <div className="calculator-inputs">
        <Card title="Your details" subtitle="Enter your income to estimate your take-home pay">
          <div className="field-grid">
            <div className="span-full">
              <Segmented
                label="Pay period"
                value={period}
                onChange={(v) => setPeriod(v as Period)}
                options={[
                  { value: 'annual', label: 'Annual' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>
            <div className="span-full">
              <NumberInput
                label={`Gross salary (${period})`}
                value={salary}
                onChange={setSalary}
                prefix="€"
                min={0}
                step={100}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="span-half">
              <NumberInput
                label="Annual bonus"
                value={bonus}
                onChange={setBonus}
                prefix="€"
                min={0}
                step={100}
                placeholder="0"
              />
            </div>
            <div className="span-full">
              <Slider
                label="Pension contribution"
                value={pension}
                onChange={setPension}
                min={0}
                max={40}
                hint="% of salary, tax-relieved at your marginal rate"
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="span-full">
              <Select
                label="Employment type"
                value={employment}
                onChange={(v) => setEmployment(v as EmploymentType)}
                options={EMPLOYMENT_OPTIONS}
              />
            </div>
            <div className="span-full">
              <Select
                label="Marital / assessment status"
                value={marital}
                onChange={(v) => setMarital(v as MaritalStatus)}
                options={MARITAL_OPTIONS}
                hint={marital === 'married-both' ? 'Assumes incomes are assessed jointly' : undefined}
              />
            </div>
            <div className="span-half">
              <Select
                label="Tax year"
                value={taxYear}
                onChange={setTaxYear}
                options={Object.values(TAX_YEARS).map((y) => ({
                  value: String(y.year),
                  label: `Tax year ${y.year}`,
                }))}
              />
            </div>
            <div className="span-half field-end">
              <Toggle
                label="I hold a medical card"
                checked={medicalCard}
                onChange={setMedicalCard}
                hint="Removes USC on income up to €60,000"
              />
            </div>
          </div>
        </Card>

        <Card title="Tax credits" subtitle="Credits automatically applied based on your situation">
          <div className="detail-list">
            <div className="detail-row">
              <span>Personal tax credit</span>
              <span>{personalCredit.toLocaleString('en-IE')} €</span>
            </div>
            <div className="detail-row">
              <span>{employment === 'self-employed' ? 'Earned income credit' : 'Employee tax credit'}</span>
              <span>{employeeCredit.toLocaleString('en-IE')} €</span>
            </div>
            {parseNumber(credits) > 0 && (
              <div className="detail-row">
                <span>Additional credits</span>
                <span>{parseNumber(credits).toLocaleString('en-IE')} €</span>
              </div>
            )}
            <div className="detail-row strong">
              <span>Total credits available</span>
              <span>{totalCredits.toLocaleString('en-IE')} €</span>
            </div>
            <div className="detail-row strong">
              <span>Credits used (capped at gross tax)</span>
              <span>{result.creditsUsed.toLocaleString('en-IE')} €</span>
            </div>
          </div>
          <div className="field-grid">
            <div className="span-full">
              <NumberInput
                label="Extra tax credits"
                value={credits}
                onChange={setCredits}
                prefix="€"
                min={0}
                step={50}
                placeholder="0"
                hint="e.g. age credit, dependent relative, tuition fees, etc."
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="calculator-results">
        <Results result={result} />
      </div>
    </div>
  )
}