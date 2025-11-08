import { startOfDay } from 'date-fns'
import { type AIAnalysisDataRow, type ControlState, type AnalysisConfig } from '../data/schema'

export function parseCSVRow(row: string[], headers: string[]): AIAnalysisDataRow {
  // Handle CSV parsing - values might be quoted
  const parseValue = (val: string): string => {
    return val.trim().replace(/^["']|["']$/g, '')
  }

  const data: AIAnalysisDataRow = {
    timestamp: parseValue(row[0] || ''),
    control_state: Number(parseValue(row[1] || '0')) as ControlState,
    t: row[row.length - 1] ? Number(parseValue(row[row.length - 1])) : null,
    MYRSPOVEN_DS: row[row.length - 2] ? Number(parseValue(row[row.length - 2])) : null,
  }

  // Add all signal columns
  for (let i = 2; i < headers.length - 2; i++) {
    const header = headers[i]
    const value = row[i]
    const parsed = value === '' || value === null ? null : Number(parseValue(value))
    data[header] = isNaN(parsed as number) ? null : parsed
  }

  return data
}

export function filterByControlAndDates(
  data: AIAnalysisDataRow[],
  config: AnalysisConfig
): AIAnalysisDataRow[] {
  if (data.length === 0) return []
  
  const onDays = new Set<string>()
  const offDays = new Set<string>()

  // Process ON period
  if (config.onStartDate && config.onEndDate && config.controlSignalType === 'myrspoven_ds') {
    const onStart = startOfDay(config.onStartDate).getTime()
    const onEnd = startOfDay(config.onEndDate).getTime()

    // Group by day and calculate daily average (optimized)
    const dailyAverages = new Map<string, { sum: number; count: number }>()
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const date = new Date(row.timestamp).getTime()
      if (date >= onStart && date <= onEnd && row.MYRSPOVEN_DS !== null) {
        // Extract date string directly from timestamp (faster than format)
        const dayKey = row.timestamp.split('T')[0]
        const existing = dailyAverages.get(dayKey)
        if (existing) {
          existing.sum += row.MYRSPOVEN_DS
          existing.count++
        } else {
          dailyAverages.set(dayKey, { sum: row.MYRSPOVEN_DS, count: 1 })
        }
      }
    }

    // Identify ON days
    for (const [dayKey, { sum, count }] of dailyAverages.entries()) {
      const avg = sum / count
      if (avg >= config.onThreshold[0] && avg <= config.onThreshold[1]) {
        onDays.add(dayKey)
      }
    }
  }

  // Process OFF period
  if (config.offStartDate && config.offEndDate && config.controlSignalType === 'myrspoven_ds') {
    const offStart = startOfDay(config.offStartDate).getTime()
    const offEnd = startOfDay(config.offEndDate).getTime()

    const dailyAverages = new Map<string, { sum: number; count: number }>()
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const date = new Date(row.timestamp).getTime()
      if (date >= offStart && date <= offEnd && row.MYRSPOVEN_DS !== null) {
        const dayKey = row.timestamp.split('T')[0]
        if (!onDays.has(dayKey)) {
          const existing = dailyAverages.get(dayKey)
          if (existing) {
            existing.sum += row.MYRSPOVEN_DS
            existing.count++
          } else {
            dailyAverages.set(dayKey, { sum: row.MYRSPOVEN_DS, count: 1 })
          }
        }
      }
    }

    // Identify OFF days
    for (const [dayKey, { sum, count }] of dailyAverages.entries()) {
      const avg = sum / count
      if (avg >= config.offThreshold[0] && avg <= config.offThreshold[1]) {
        offDays.add(dayKey)
      }
    }
  }

  // Filter data based on identified days
  const filtered: AIAnalysisDataRow[] = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const dayKey = row.timestamp.split('T')[0]

    if (onDays.has(dayKey)) {
      filtered.push({ ...row, control_state: 1 })
    } else if (offDays.has(dayKey)) {
      filtered.push({ ...row, control_state: 0 })
    }
  }

  return filtered
}

export function filterByTemperature(
  data: AIAnalysisDataRow[],
  tempRange: [number, number]
): AIAnalysisDataRow[] {
  if (data.length === 0) return []
  const filtered: AIAnalysisDataRow[] = []
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row.t !== null && row.t >= tempRange[0] && row.t <= tempRange[1]) {
      filtered.push(row)
    }
  }
  return filtered
}

export function filterByHour(
  data: AIAnalysisDataRow[],
  hourRange: [number, number]
): AIAnalysisDataRow[] {
  if (data.length === 0) return []
  if (hourRange[0] === 0 && hourRange[1] === 24) return data // No filtering needed
  
  const filtered: AIAnalysisDataRow[] = []
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    // Extract hour directly from timestamp string (faster than parsing)
    const hourMatch = row.timestamp.match(/T(\d{2}):/)
    if (hourMatch) {
      const hour = parseInt(hourMatch[1], 10)
      if (hour >= hourRange[0] && hour <= hourRange[1]) {
        filtered.push(row)
      }
    }
  }
  return filtered
}

export function applyValueRangeFilter(
  data: AIAnalysisDataRow[],
  signalName: string,
  lowPercentile: number,
  highPercentile: number
): AIAnalysisDataRow[] {
  const values = data
    .map((row) => row[signalName] as number | null)
    .filter((v): v is number => v !== null && !isNaN(v))
    .sort((a, b) => a - b)

  if (values.length === 0) return data

  const lowIndex = Math.floor((lowPercentile / 100) * values.length)
  const highIndex = Math.ceil((highPercentile / 100) * values.length)
  const lowValue = values[lowIndex] ?? values[0]
  const highValue = values[highIndex] ?? values[values.length - 1]

  return data.filter((row) => {
    const value = row[signalName] as number | null
    if (value === null || isNaN(value)) return false
    return value >= lowValue && value <= highValue
  })
}

export function calculateAverageSignal(
  data: AIAnalysisDataRow[],
  signalNames: string[]
): AIAnalysisDataRow[] {
  return data.map((row) => {
    const values = signalNames
      .map((name) => row[name] as number | null)
      .filter((v): v is number => v !== null && !isNaN(v))

    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
    return {
      ...row,
      average_signal: average,
    }
  })
}

