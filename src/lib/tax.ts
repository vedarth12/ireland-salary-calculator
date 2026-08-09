export type EmploymentType = 'employee' | 'self-employed' | 'director'
export type MaritalStatus = 'single' | 'single-parent' | 'married-one' | 'married-both'
export type Period = 'monthly' | 'annual'

export interface TaxYearConfig {
  year: number
  payeBands: {
    single: number
    singleParent: number
    marriedOne: number
    marriedBoth: number
  }
  taxCredits: {
    personal: number
    employee: number
  }
  uscBands: { upTo: number; rate: number }[]
  uscStandardRate: number
  uscMaxRate: number
  uscMaxRateStart: number
  uscSelfEmployedSurchargeRate: number
  uscSelfEmployedSurchargeStart: number
  prsiRate: number
  prsiExempt: number
  medicalCardLimit: number
  minimumWageHourly: number
}

export const TAX_YEARS: Record<number, TaxYearConfig> = {
  2024: {
    year: 2024,
    payeBands: {
      single: 42000,
      singleParent: 46000,
      marriedOne: 49000,
      marriedBoth: 67000,
    },
    taxCredits: { personal: 1875, employee: 2000 },
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 26976, rate: 0.02 },
      { upTo: 70044, rate: 0.04 },
    ],
    uscStandardRate: 0.08,
    uscMaxRate: 0.08,
    uscMaxRateStart: 70044,
    uscSelfEmployedSurchargeRate: 0.11,
    uscSelfEmployedSurchargeStart: 100000,
    prsiRate: 0.04,
    prsiExempt: 18304,
    medicalCardLimit: 60000,
    minimumWageHourly: 12.7,
  },
  2025: {
    year: 2025,
    payeBands: {
      single: 44000,
      singleParent: 49000,
      marriedOne: 52000,
      marriedBoth: 70000,
    },
    taxCredits: { personal: 1875, employee: 2000 },
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 26976, rate: 0.02 },
      { upTo: 70044, rate: 0.04 },
    ],
    uscStandardRate: 0.08,
    uscMaxRate: 0.08,
    uscMaxRateStart: 70044,
    uscSelfEmployedSurchargeRate: 0.11,
    uscSelfEmployedSurchargeStart: 100000,
    prsiRate: 0.04,
    prsiExempt: 18304,
    medicalCardLimit: 60000,
    minimumWageHourly: 13.5,
  },
}

export interface CalculatorInput {
  salaryAnnual: number
  bonusAnnual: number
  pensionPercent: number
  additionalCredits: number
  employment: EmploymentType
  marital: MaritalStatus
  medicalCard: boolean
  taxYear: number
}

export interface TaxLine {
  amount: number
  rate: number
  taxable: number
}

export interface CalculatorResult {
  config: TaxYearConfig
  grossAnnual: number
  grossMonthly: number
  grossWeekly: number
  pensionAnnual: number
  pensionMonthly: number
  taxableAnnual: number
  paye: TaxLine
  usc: TaxLine
  prsi: TaxLine
  totalDeductions: number
  netAnnual: number
  netMonthly: number
  netWeekly: number
  effectiveRate: number
  marginalRate: number
  creditsUsed: number
  standardBand: number
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function getTaxYearConfig(year: number): TaxYearConfig {
  return TAX_YEARS[year] ?? TAX_YEARS[2025]
}

export function standardRateBand(config: TaxYearConfig, marital: MaritalStatus): number {
  switch (marital) {
    case 'single-parent':
      return config.payeBands.singleParent
    case 'married-one':
      return config.payeBands.marriedOne
    case 'married-both':
      return config.payeBands.marriedBoth
    case 'single':
    default:
      return config.payeBands.single
  }
}

export function totalTaxCredits(
  config: TaxYearConfig,
  employment: EmploymentType,
  additional: number,
): number {
  const employee = employment === 'employee' || employment === 'director'
  return config.taxCredits.personal + (employee ? config.taxCredits.employee : 0) + additional
}

export function calcUSC(
  income: number,
  config: TaxYearConfig,
  isSelfEmployed: boolean,
  medicalCard: boolean,
): number {
  if (medicalCard && income <= config.medicalCardLimit) return 0

  let tax = 0
  let prev = 0
  for (const band of config.uscBands) {
    const amount = Math.max(0, Math.min(income, band.upTo) - prev)
    tax += amount * band.rate
    prev = band.upTo
  }

  if (income > config.uscMaxRateStart) {
    const above = income - config.uscMaxRateStart
    if (isSelfEmployed && income > config.uscSelfEmployedSurchargeStart) {
      tax +=
        (config.uscSelfEmployedSurchargeStart - config.uscMaxRateStart) * config.uscStandardRate +
        (income - config.uscSelfEmployedSurchargeStart) * config.uscSelfEmployedSurchargeRate
    } else {
      tax += above * config.uscStandardRate
    }
  }

  return tax
}

export function calcPRSI(income: number, config: TaxYearConfig, employment: EmploymentType): number {
  if (employment === 'self-employed') {
    return Math.max(0, income - 5000) * config.prsiRate
  }
  return Math.max(0, income - config.prsiExempt) * config.prsiRate
}

export function calculateTax(input: CalculatorInput): CalculatorResult {
  const config = getTaxYearConfig(input.taxYear)
  const grossAnnual = input.salaryAnnual + input.bonusAnnual
  const pensionAnnual = (input.salaryAnnual * Math.min(input.pensionPercent, 100)) / 100
  const taxableAnnual = Math.max(0, grossAnnual - pensionAnnual)

  const band = standardRateBand(config, input.marital)
  const credits = totalTaxCredits(config, input.employment, input.additionalCredits)

  const stdBandAmount = Math.min(taxableAnnual, band)
  const higherAmount = Math.max(0, taxableAnnual - band)
  const grossPaye = stdBandAmount * 0.2 + higherAmount * 0.4
  const paye = Math.max(0, grossPaye - credits)
  const creditsUsed = Math.min(grossPaye, credits)

  const isSelfEmployed = input.employment === 'self-employed'
  const usc = calcUSC(taxableAnnual, config, isSelfEmployed, input.medicalCard)
  const prsi = calcPRSI(taxableAnnual, config, input.employment)

  const totalDeductions = paye + usc + prsi
  const netAnnual = grossAnnual - pensionAnnual - totalDeductions

  const effectiveRate = grossAnnual > 0 ? totalDeductions / grossAnnual : 0

  const marginalBase = taxableAnnual
  let marginalRate: number
  if (marginalBase > band) {
    marginalRate = 0.4
  } else {
    marginalRate = 0.2
  }
  if (marginalBase > config.uscMaxRateStart) {
    marginalRate += isSelfEmployed && marginalBase > config.uscSelfEmployedSurchargeStart
      ? config.uscSelfEmployedSurchargeRate
      : config.uscStandardRate
  } else {
    const uscBand = config.uscBands.find((b) => marginalBase <= b.upTo)
    marginalRate += uscBand ? uscBand.rate : 0.04
  }
  const paysPrsi = isSelfEmployed
    ? marginalBase > 5000
    : marginalBase > config.prsiExempt
  if (paysPrsi) {
    marginalRate += config.prsiRate
  }

  return {
    config,
    grossAnnual,
    grossMonthly: round2(grossAnnual / 12),
    grossWeekly: round2(grossAnnual / 52),
    pensionAnnual,
    pensionMonthly: round2(pensionAnnual / 12),
    taxableAnnual,
    paye: { amount: round2(paye), rate: 0.2, taxable: round2(taxableAnnual) },
    usc: { amount: round2(usc), rate: 0.04, taxable: round2(taxableAnnual) },
    prsi: { amount: round2(prsi), rate: config.prsiRate, taxable: round2(taxableAnnual) },
    totalDeductions: round2(totalDeductions),
    netAnnual: round2(netAnnual),
    netMonthly: round2(netAnnual / 12),
    netWeekly: round2(netAnnual / 52),
    effectiveRate,
    marginalRate: round2(marginalRate),
    creditsUsed: round2(creditsUsed),
    standardBand: band,
  }
}
