import { format, parseISO, startOfDay } from 'date-fns'
import { type AIAnalysisDataRow, type SavingsData } from '../data/schema'
import { createTemperatureBin } from './temperature-binning'

export interface TemperatureHistogram {
  weekday: Map<number, number> // temp_bin -> diff (OFF_mean - ON_mean)
  weekend: Map<number, number>
}

export function createTemperatureHistogram(
  data: AIAnalysisDataRow[],
  signalName: string,
  minSamples: number
): TemperatureHistogram {
  const weekday = new Map<number, { on: number[]; off: number[] }>()
  const weekend = new Map<number, { on: number[]; off: number[] }>()

  // Group by weekday/weekend and temperature bin
  for (const row of data) {
    if (row.t === null) continue
    const signalValue = row[signalName] as number | null
    if (signalValue === null || isNaN(signalValue)) continue

    const bin = createTemperatureBin(row.t)
    const date = parseISO(row.timestamp)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const target = isWeekend ? weekend : weekday

    if (!target.has(bin)) {
      target.set(bin, { on: [], off: [] })
    }

    const binData = target.get(bin)!
    if (row.control_state === 1) {
      binData.on.push(signalValue)
    } else {
      binData.off.push(signalValue)
    }
  }

  // Calculate differences for each bin
  const weekdayDiffs = new Map<number, number>()
  const weekendDiffs = new Map<number, number>()

  for (const [bin, values] of weekday.entries()) {
    if (values.on.length >= minSamples && values.off.length >= minSamples) {
      const onMean = values.on.reduce((a, b) => a + b, 0) / values.on.length
      const offMean = values.off.reduce((a, b) => a + b, 0) / values.off.length
      weekdayDiffs.set(bin, offMean - onMean) // Savings = OFF - ON
    }
  }

  for (const [bin, values] of weekend.entries()) {
    if (values.on.length >= minSamples && values.off.length >= minSamples) {
      const onMean = values.on.reduce((a, b) => a + b, 0) / values.on.length
      const offMean = values.off.reduce((a, b) => a + b, 0) / values.off.length
      weekendDiffs.set(bin, offMean - onMean)
    }
  }

  return { weekday: weekdayDiffs, weekend: weekendDiffs }
}

export function calculateDailySavings(
  data: AIAnalysisDataRow[],
  _signalName: string,
  histogram: TemperatureHistogram,
  savingsStartDate: Date,
  savingsEndDate: Date
): SavingsData[] {
  const dailySavings = new Map<string, SavingsData>()
  const start = startOfDay(savingsStartDate)
  const end = startOfDay(savingsEndDate)

  for (const row of data) {
    const date = parseISO(row.timestamp)
    if (date < start || date > end) continue

    const dayKey = format(date, 'yyyy-MM-dd')
    if (!dailySavings.has(dayKey)) {
      dailySavings.set(dayKey, {
        date: dayKey,
        actualSavings: 0,
        potentialSavings: 0,
        forfeitedSavings: 0,
        uptime: 0,
      })
    }

    const dayData = dailySavings.get(dayKey)!
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const hist = isWeekend ? histogram.weekend : histogram.weekday

    if (row.t !== null && row.control_state === 1) {
      const bin = createTemperatureBin(row.t)
      const diff = hist.get(bin) ?? 0
      dayData.actualSavings += diff
      dayData.potentialSavings += diff
    } else if (row.t !== null) {
      const bin = createTemperatureBin(row.t)
      const diff = hist.get(bin) ?? 0
      dayData.potentialSavings += diff
      dayData.forfeitedSavings += diff
    }
  }

  // Calculate uptime for each day
  const dailyCounts = new Map<string, { on: number; total: number }>()
  for (const row of data) {
    const date = parseISO(row.timestamp)
    if (date < start || date > end) continue
    const dayKey = format(date, 'yyyy-MM-dd')
    if (!dailyCounts.has(dayKey)) {
      dailyCounts.set(dayKey, { on: 0, total: 0 })
    }
    const counts = dailyCounts.get(dayKey)!
    counts.total++
    if (row.control_state === 1) counts.on++
  }

  for (const [dayKey, savings] of dailySavings.entries()) {
    const counts = dailyCounts.get(dayKey)
    if (counts && counts.total > 0) {
      savings.uptime = (counts.on / counts.total) * 100
    }
  }

  return Array.from(dailySavings.values()).sort((a, b) => a.date.localeCompare(b.date))
}

