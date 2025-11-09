import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { useAIAnalysisData } from '@/features/ai-analysis/data/api-service'
import { type AIVsBaselineConfig, type TimeSeriesPoint, type OfflinePeriod } from './schema'
import { type AIAnalysisDataRow } from '@/features/ai-analysis/data/schema'

/**
 * Filter raw data by date range (more efficient than filtering TimeSeriesPoint[])
 */
function filterRawDataByDateRange(
  data: AIAnalysisDataRow[],
  startDate: Date,
  endDate: Date
): AIAnalysisDataRow[] {
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  return data.filter((row) => {
    const rowTime = new Date(row.timestamp).getTime()
    return rowTime >= startTime && rowTime <= endTime
  })
}

/**
 * Build an indexed structure of off-state values for efficient baseline lookup
 * Groups by hour of day and temperature bins
 */
function buildOffStateIndex(
  rawData: AIAnalysisDataRow[],
  signalName: string
): Map<string, number[]> {
  const index = new Map<string, number[]>()
  const tempTolerance = 2 // ±2°C tolerance
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    
    // Only process off-state rows with valid signal values
    if (row.control_state !== 0) continue
    
    const signalValue = row[signalName] as number | null
    if (signalValue === null || isNaN(signalValue)) continue
    
    const rowDate = new Date(row.timestamp)
    const hour = rowDate.getHours()
    const temp = row.t !== null ? Math.round(row.t / tempTolerance) * tempTolerance : null
    
    // Create index key: hour_temperature (or just hour if no temp)
    const key = temp !== null ? `${hour}_${temp}` : `${hour}_null`
    
    let values = index.get(key)
    if (!values) {
      values = []
      index.set(key, values)
    }
    values.push(signalValue)
  }
  
  return index
}

/**
 * Calculate baseline value efficiently using pre-built index
 */
function calculateBaselineFromIndex(
  currentRow: AIAnalysisDataRow,
  signalName: string,
  offStateIndex: Map<string, number[]>,
  windowData: AIAnalysisDataRow[],
  windowStartTime: number
): number | null {
  // If currently off-state, baseline equals the signal value
  if (currentRow.control_state === 0) {
    const signalValue = currentRow[signalName] as number | null
    if (signalValue !== null && !isNaN(signalValue)) {
      return signalValue
    }
  }
  
  // If on-state, estimate baseline from similar off-state conditions
  const currentDate = new Date(currentRow.timestamp)
  const currentHour = currentDate.getHours()
  const currentTemp = currentRow.t !== null ? currentRow.t : null
  const tempTolerance = 2
  
  // Try to find matching off-state values from index
  const candidates: number[] = []
  
  // Priority 1: Same hour + same temperature bin
  if (currentTemp !== null) {
    const tempBin = Math.round(currentTemp / tempTolerance) * tempTolerance
    const key1 = `${currentHour}_${tempBin}`
    const values1 = offStateIndex.get(key1)
    if (values1) {
      candidates.push(...values1)
    }
  }
  
  // Priority 2: Same hour, any temperature
  if (!candidates.length) {
    // Try exact hour match
    for (const [key, values] of offStateIndex.entries()) {
      if (key.startsWith(`${currentHour}_`)) {
        candidates.push(...values)
      }
    }
  }
  
  // Priority 3: Similar temperature, any hour (from recent window)
  if (!candidates.length && currentTemp !== null) {
    const tempBin = Math.round(currentTemp / tempTolerance) * tempTolerance
    for (let i = windowData.length - 1; i >= 0; i--) {
      const row = windowData[i]
      const rowTime = new Date(row.timestamp).getTime()
      if (rowTime < windowStartTime) break
      
      if (row.control_state === 0) {
        const rowTemp = row.t !== null ? Math.round(row.t / tempTolerance) * tempTolerance : null
        if (rowTemp === tempBin) {
          const signalValue = row[signalName] as number | null
          if (signalValue !== null && !isNaN(signalValue)) {
            candidates.push(signalValue)
            if (candidates.length >= 10) break // Limit to 10 samples
          }
        }
      }
    }
  }
  
  // Priority 4: Any off-state from last 24 hours
  if (!candidates.length) {
    const oneDayAgo = currentDate.getTime() - 24 * 60 * 60 * 1000
    for (let i = windowData.length - 1; i >= 0; i--) {
      const row = windowData[i]
      const rowTime = new Date(row.timestamp).getTime()
      if (rowTime < oneDayAgo) break
      
      if (row.control_state === 0) {
        const signalValue = row[signalName] as number | null
        if (signalValue !== null && !isNaN(signalValue)) {
          candidates.push(signalValue)
          if (candidates.length >= 20) break // Limit to 20 samples
        }
      }
    }
  }
  
  if (candidates.length === 0) {
    return null
  }
  
  // Use average of collected off-state values
  const sum = candidates.reduce((a, b) => a + b, 0)
  return sum / candidates.length
}

/**
 * Transform raw data to time series format with signal, min, max, and baseline
 * Optimized to build index once and reuse it
 */
function transformToTimeSeries(
  rawData: AIAnalysisDataRow[],
  signalName: string,
  signalMin: number,
  signalMax: number,
  startDate: Date | null,
  endDate: Date | null
): TimeSeriesPoint[] {
  // Filter by date range first if specified
  let dataToProcess = rawData
  if (startDate && endDate) {
    dataToProcess = filterRawDataByDateRange(rawData, startDate, endDate)
  }
  
  if (dataToProcess.length === 0) {
    return []
  }
  
  // Build off-state index once (use all raw data for better baseline estimation)
  const offStateIndex = buildOffStateIndex(rawData, signalName)
  
  // Calculate window start time (48 hours before first data point)
  const firstDataTime = new Date(dataToProcess[0].timestamp).getTime()
  const windowStartTime = firstDataTime - 48 * 60 * 60 * 1000
  const windowEndTime = firstDataTime + 48 * 60 * 60 * 1000
  
  // Get window data for fallback lookups (optimized: binary search would be better but linear is OK for now)
  const windowData: AIAnalysisDataRow[] = []
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    const rowTime = new Date(row.timestamp).getTime()
    if (rowTime < windowStartTime) continue
    if (rowTime > windowEndTime) break // Data is sorted by timestamp, so we can break early
    windowData.push(row)
  }
  
  // Transform to time series
  const timeSeries: TimeSeriesPoint[] = []
  
  for (let i = 0; i < dataToProcess.length; i++) {
    const row = dataToProcess[i]
    const signalValue = row[signalName] as number | null
    const baseline = calculateBaselineFromIndex(
      row,
      signalName,
      offStateIndex,
      windowData,
      windowStartTime
    )
    
    timeSeries.push({
      timestamp: row.timestamp,
      signal: signalValue !== null && !isNaN(signalValue) ? signalValue : null,
      signalMin,
      signalMax,
      baseline,
      isAIOffline: row.MYRSPOVEN_DS === 0 || row.MYRSPOVEN_DS === null,
    })
  }
  
  return timeSeries
}

/**
 * Extract offline periods from time series data
 */
function extractOfflinePeriods(data: TimeSeriesPoint[]): OfflinePeriod[] {
  const periods: OfflinePeriod[] = []
  let currentPeriodStart: string | null = null
  
  for (let i = 0; i < data.length; i++) {
    const point = data[i]
    
    if (point.isAIOffline) {
      if (currentPeriodStart === null) {
        currentPeriodStart = point.timestamp
      }
    } else {
      if (currentPeriodStart !== null) {
        // End of offline period - use previous point's timestamp as end
        const endTimestamp = i > 0 ? data[i - 1].timestamp : point.timestamp
        periods.push({
          start: currentPeriodStart,
          end: endTimestamp,
        })
        currentPeriodStart = null
      }
    }
  }
  
  // Handle case where offline period extends to end of data
  if (currentPeriodStart !== null && data.length > 0) {
    periods.push({
      start: currentPeriodStart,
      end: data[data.length - 1].timestamp,
    })
  }
  
  return periods
}
function getSignalMinMax(
  rawData: AIAnalysisDataRow[],
  signalName: string
): { min: number; max: number } {
  const values: number[] = []
  
  for (const row of rawData) {
    const value = row[signalName] as number | null
    if (value !== null && !isNaN(value)) {
      values.push(value)
    }
  }
  
  if (values.length === 0) {
    return { min: 0, max: 100 }
  }
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

/**
 * Hook to get AI vs Baseline data
 */
export function useAIVsBaseline(config: AIVsBaselineConfig) {
  const { data: rawData } = useAIAnalysisData()

  return useQuery({
    queryKey: ['ai-vs-baseline', config, rawData],
    queryFn: () => {
      if (!rawData || rawData.length === 0 || !config.selectedVariable) {
        return {
          timeSeriesData: [] as TimeSeriesPoint[],
          offlinePeriods: [] as OfflinePeriod[],
        }
      }

      // Get signal min/max from actual data (only from filtered range if specified)
      let dataForMinMax = rawData
      if (config.startDate && config.endDate) {
        dataForMinMax = filterRawDataByDateRange(rawData, config.startDate, config.endDate)
      }
      const { min, max } = getSignalMinMax(dataForMinMax, config.selectedVariable)

      // Transform to time-series format (handles date filtering internally)
      const timeSeriesData = transformToTimeSeries(
        rawData,
        config.selectedVariable,
        min,
        max,
        config.startDate,
        config.endDate
      )

      // Extract offline periods
      const offlinePeriods = extractOfflinePeriods(timeSeriesData)

      return {
        timeSeriesData,
        offlinePeriods,
      }
    },
    enabled: !!rawData && !!config.selectedVariable,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}

/**
 * Get default config based on available data
 */
export function getDefaultAIVsBaselineConfig(data: AIAnalysisDataRow[] | undefined): AIVsBaselineConfig {
  const now = new Date()
  const endDate = data && data.length > 0 ? new Date(data[data.length - 1].timestamp) : now
  const startDate = subDays(endDate, 11) // Default to last 11 days

  // Get first available signal as default
  let selectedVariable: string | null = null
  if (data && data.length > 0) {
    const availableSignals = Object.keys(data[0]).filter(
      (key) => !['timestamp', 'control_state', 't', 'MYRSPOVEN_DS'].includes(key)
    )
    selectedVariable = availableSignals.length > 0 ? availableSignals[0] : null
  }

  return {
    startDate,
    endDate,
    selectedVariable,
  }
}

/**
 * Get all available variables/signals
 */
export function getAvailableVariables(data: AIAnalysisDataRow[] | undefined): string[] {
  if (!data || data.length === 0) return []
  return Object.keys(data[0]).filter(
    (key) => !['timestamp', 'control_state', 't', 'MYRSPOVEN_DS'].includes(key)
  )
}

