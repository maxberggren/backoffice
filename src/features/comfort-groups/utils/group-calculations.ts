import { type AIAnalysisDataRow } from '@/features/ai-analysis/data/schema'
import { type TimeSeriesPoint, type GroupData } from '../data/schema'
import { calculateAverageSignal } from '@/features/ai-analysis/utils/data-processing'

/**
 * Calculate time-series averages for a group of signals
 */
export function calculateGroupAverage(
  data: AIAnalysisDataRow[],
  signalNames: string[]
): AIAnalysisDataRow[] {
  return calculateAverageSignal(data, signalNames)
}

/**
 * Transform data into time-series format with group averages
 */
export function transformToTimeSeries(
  data: AIAnalysisDataRow[],
  groupData: GroupData[]
): TimeSeriesPoint[] {
  if (data.length === 0) return []

  // Create a map of timestamp to point
  const timeSeriesMap = new Map<string, TimeSeriesPoint>()

  // Process each group
  for (const group of groupData) {
    const averagedData = calculateGroupAverage(data, group.signalNames)

    for (const row of averagedData) {
      const timestamp = row.timestamp
      let point = timeSeriesMap.get(timestamp)

      if (!point) {
        point = { timestamp }
        timeSeriesMap.set(timestamp, point)
      }

      // Calculate average for this group at this timestamp
      const values = group.signalNames
        .map((name) => row[name] as number | null)
        .filter((v): v is number => v !== null && !isNaN(v))

      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null

      // Use category name as key
      point[group.category.name] = average !== null ? average : null
    }
  }

  // Convert map to array and sort by timestamp
  return Array.from(timeSeriesMap.values()).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  )
}

/**
 * Filter data by date range
 */
export function filterByDateRange(
  data: TimeSeriesPoint[],
  startDate: Date | null,
  endDate: Date | null
): TimeSeriesPoint[] {
  if (!startDate || !endDate) return data

  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  return data.filter((point) => {
    const pointTime = new Date(point.timestamp).getTime()
    return pointTime >= startTime && pointTime <= endTime
  })
}

