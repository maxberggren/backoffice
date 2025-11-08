import { type SignalCategory } from './schema'

export const SIGNAL_CATEGORIES: SignalCategory[] = [
  {
    id: 'vs_vsgt',
    name: 'Heating Circuit Temp.',
    pattern: /^VS\d+_GT\d+$/,
    hasNormalization: true,
  },
  {
    id: 'vs_lbgt',
    name: 'AHU Supply Air Temp.',
    pattern: /^LB\d+_GT\d+$/,
    hasTemperatureDiff: true,
  },
  {
    id: 'vs_lbgp',
    name: 'AHU Pressure',
    pattern: /^LB\d+_GP\d+$/,
    hasAffinityLaw: true,
  },
  {
    id: 'os_deg',
    name: 'Sensor Temp.',
    pattern: /_temperature$/,
  },
]

export function getSignalsForCategory(
  category: SignalCategory,
  allColumns: string[]
): string[] {
  return allColumns.filter((col) => {
    if (col === 'timestamp' || col === 'control_state' || col === 't' || col === 'MYRSPOVEN_DS') {
      return false
    }
    if (typeof category.pattern === 'string') {
      return col.includes(category.pattern)
    }
    return category.pattern.test(col)
  })
}


