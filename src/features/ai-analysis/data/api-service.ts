import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import {
  type AIAnalysisDataRow,
  type AnalysisConfig,
  type DailyDistribution,
  type ImpactMetrics,
  type ScatterPoint,
  type SignalAvailability,
} from './schema'
import { parseCSVRow, filterByControlAndDates, filterByTemperature, filterByHour, calculateAverageSignal } from '../utils/data-processing'
import { calculateBinStats } from '../utils/temperature-binning'

let cachedData: AIAnalysisDataRow[] | null = null

// Optimized CSV parser that processes in chunks to avoid blocking
function parseCSVLine(line: string): string[] {
  const row: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
    } else {
      current += char
    }
  }
  row.push(current)
  return row
}

function parseHeaders(headerLine: string): string[] {
  const headers: string[] = []
  let currentHeader = ''
  let inQuotes = false
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      headers.push(currentHeader.trim())
      currentHeader = ''
    } else {
      currentHeader += char
    }
  }
  headers.push(currentHeader.trim())
  return headers
}

async function processChunk(
  lines: string[],
  startIndex: number,
  endIndex: number,
  headers: string[]
): Promise<AIAnalysisDataRow[]> {
  const chunk: AIAnalysisDataRow[] = []
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    const row = parseCSVLine(line)
    if (row.length === headers.length) {
      chunk.push(parseCSVRow(row, headers))
    }
  }
  return chunk
}

async function loadCSVData(): Promise<AIAnalysisDataRow[]> {
  if (cachedData) return cachedData

  try {
    const response = await fetch('/filtered_dataset.csv')
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`)
    }
    const text = await response.text()
    const lines = text.trim().split('\n')
    
    // Parse headers
    const headers = parseHeaders(lines[0])

    // Process in smaller chunks to avoid blocking the UI
    const CHUNK_SIZE = 200 // Reduced chunk size for faster initial response
    const data: AIAnalysisDataRow[] = []
    
    for (let i = 1; i < lines.length; i += CHUNK_SIZE) {
      const endIndex = Math.min(i + CHUNK_SIZE, lines.length)
      const chunk = await processChunk(lines, i, endIndex, headers)
      data.push(...chunk)
      
      // Yield to browser more frequently
      if (i + CHUNK_SIZE < lines.length) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    cachedData = data
    return data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading CSV data:', error)
    throw error
  }
}

export function useAIAnalysisData() {
  return useQuery({
    queryKey: ['ai-analysis-data'],
    queryFn: loadCSVData,
    staleTime: Infinity,
    gcTime: Infinity, // Keep in cache forever
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useFilteredData(config: AnalysisConfig) {
  const { data: rawData } = useAIAnalysisData()

  return useQuery({
    queryKey: ['filtered-data', config, rawData],
    queryFn: () => {
      if (!rawData) return []
      let filtered = filterByControlAndDates(rawData, config)
      filtered = filterByTemperature(filtered, config.temperatureRange)
      filtered = filterByHour(filtered, config.hourRange)
      return filtered
    },
    enabled: !!rawData,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}

export function useDailyDistribution(config: AnalysisConfig) {
  const { data: filteredData } = useFilteredData(config)

  return useQuery({
    queryKey: ['daily-distribution', config, filteredData],
    queryFn: () => {
      if (!filteredData) return []
      const distribution = new Map<string, DailyDistribution>()

      for (let i = 0; i < filteredData.length; i++) {
        const row = filteredData[i]
        // Extract date directly from timestamp (faster than format)
        const date = row.timestamp.split('T')[0]
        let day = distribution.get(date)
        if (!day) {
          day = { date, onCount: 0, offCount: 0 }
          distribution.set(date, day)
        }
        if (row.control_state === 1) {
          day.onCount++
        } else {
          day.offCount++
        }
      }

      return Array.from(distribution.values()).sort((a, b) => a.date.localeCompare(b.date))
    },
    enabled: !!filteredData,
  })
}

export function useTemperatureAnalysis(
  config: AnalysisConfig,
  signalName: string | null,
  dayFilter: 'all' | 'weekdays' | 'weekend' | string,
  categorySignals?: string[]
) {
  const { data: filteredData } = useFilteredData(config)

  return useQuery({
    queryKey: ['temperature-analysis', config, signalName, dayFilter, categorySignals, filteredData],
    queryFn: () => {
      if (!filteredData || !signalName) return null

      // Calculate average signal if needed
      let data = filteredData
      let actualSignalName = signalName
      if (signalName === 'average_signal' && categorySignals && categorySignals.length > 0) {
        data = calculateAverageSignal(data, categorySignals)
        actualSignalName = 'average_signal'
      }

      // Apply day filter
      if (dayFilter === 'weekdays') {
        data = data.filter((row) => {
          const day = new Date(row.timestamp).getDay()
          return day >= 1 && day <= 5
        })
      } else if (dayFilter === 'weekend') {
        data = data.filter((row) => {
          const day = new Date(row.timestamp).getDay()
          return day === 0 || day === 6
        })
      } else if (dayFilter !== 'all') {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const targetDay = dayNames.indexOf(dayFilter.toLowerCase())
        if (targetDay !== -1) {
          data = data.filter((row) => new Date(row.timestamp).getDay() === targetDay)
        }
      }

      const bins = calculateBinStats(data, actualSignalName, config.minSamplesThreshold)

      // Calculate impact metrics
      const overlapBins = Array.from(bins.values()).filter((b) => b.isReliable)
      let simpleAverageDiff = 0
      let simpleAveragePctDiff = 0
      let weightedAverageDiff = 0
      let weightedAveragePctDiff = 0
      let totalWeight = 0

      if (overlapBins.length > 0) {
        const onMeans = overlapBins.map((b) => b.onMean)
        const offMeans = overlapBins.map((b) => b.offMean)
        const onMean = onMeans.reduce((a, b) => a + b, 0) / onMeans.length
        const offMean = offMeans.reduce((a, b) => a + b, 0) / offMeans.length

        simpleAverageDiff = onMean - offMean
        simpleAveragePctDiff = offMean !== 0 ? (simpleAverageDiff / Math.abs(offMean)) * 100 : 0

        // Weighted calculation
        const totalCount = overlapBins.reduce((sum, b) => sum + b.onCount + b.offCount, 0)
        for (const bin of overlapBins) {
          const weight = (bin.onCount + bin.offCount) / totalCount
          weightedAverageDiff += (bin.onMean - bin.offMean) * weight
          totalWeight += weight
        }
        if (totalWeight > 0) {
          weightedAverageDiff /= totalWeight
          const weightedOffMean = overlapBins.reduce(
            (sum, b) => sum + (b.offMean * (b.onCount + b.offCount)) / totalCount,
            0
          )
          weightedAveragePctDiff =
            weightedOffMean !== 0 ? (weightedAverageDiff / Math.abs(weightedOffMean)) * 100 : 0
        }
      }

      const onCount = data.filter((r) => r.control_state === 1).length
      const totalCount = data.length
      const uptime = totalCount > 0 ? (onCount / totalCount) * 100 : 0

      const metrics: ImpactMetrics = {
        simpleAverageDiff,
        simpleAveragePctDiff,
        weightedAverageDiff: data.length >= 365 * 24 ? weightedAverageDiff : null,
        weightedAveragePctDiff: data.length >= 365 * 24 ? weightedAveragePctDiff : null,
        uptime,
        uptimeCorrectedDiff: simpleAverageDiff * (uptime / 100),
        uptimeCorrectedPctDiff: simpleAveragePctDiff * (uptime / 100),
        reliableBinsCount: overlapBins.length,
      }

      return {
        bins: Array.from(bins.values()).sort((a, b) => a.bin - b.bin),
        metrics,
      }
    },
    enabled: !!filteredData && !!signalName,
  })
}

export function useScatterData(config: AnalysisConfig, signalName: string | null, categorySignals?: string[]) {
  const { data: filteredData } = useFilteredData(config)

  return useQuery({
    queryKey: ['scatter-data', config, signalName, categorySignals, filteredData],
    queryFn: () => {
      if (!filteredData || !signalName) return []
      
      let data = filteredData
      let actualSignalName = signalName
      if (signalName === 'average_signal' && categorySignals && categorySignals.length > 0) {
        data = calculateAverageSignal(data, categorySignals)
        actualSignalName = 'average_signal'
      }

      const points: ScatterPoint[] = []
      for (const row of data) {
        if (row.t !== null) {
          const value = row[actualSignalName] as number | null
          if (value !== null && !isNaN(value)) {
            points.push({
              temperature: row.t,
              signalValue: value,
              controlState: row.control_state,
            })
          }
        }
      }
      return points
    },
    enabled: !!filteredData && !!signalName,
  })
}

export function useSignalAvailability(
  config: AnalysisConfig,
  signalName: string | null,
  categorySignals?: string[]
) {
  const { data: filteredData } = useFilteredData(config)

  return useQuery({
    queryKey: ['signal-availability', config, signalName, categorySignals, filteredData],
    queryFn: () => {
      if (!filteredData || !signalName) return null
      
      let data = filteredData
      let actualSignalName = signalName
      if (signalName === 'average_signal' && categorySignals && categorySignals.length > 0) {
        data = calculateAverageSignal(data, categorySignals)
        actualSignalName = 'average_signal'
      }

      const availability = new Map<string, SignalAvailability>()

      for (const row of data) {
        const date = format(new Date(row.timestamp), 'yyyy-MM-dd')
        if (!availability.has(date)) {
          availability.set(date, { date, available: 0, missing: 0 })
        }
        const day = availability.get(date)!
        const value = row[actualSignalName] as number | null
        if (value !== null && !isNaN(value)) {
          day.available++
        } else {
          day.missing++
        }
      }

      const total = Array.from(availability.values()).reduce(
        (sum, day) => sum + day.available + day.missing,
        0
      )
      const available = Array.from(availability.values()).reduce(
        (sum, day) => sum + day.available,
        0
      )
      const percentage = total > 0 ? (available / total) * 100 : 0

      return {
        daily: Array.from(availability.values()).sort((a, b) => a.date.localeCompare(b.date)),
        percentage,
      }
    },
    enabled: !!filteredData && !!signalName,
  })
}

export function getDefaultConfig(data: AIAnalysisDataRow[] | undefined): AnalysisConfig {
  const now = new Date()
  const endDate = data && data.length > 0 ? new Date(data[data.length - 1].timestamp) : now
  const startDate = subDays(endDate, 400)

  const temps = data?.map((r) => r.t).filter((t): t is number => t !== null) ?? []
  const minTemp = temps.length > 0 ? Math.min(...temps) : -20
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 40

  return {
    controlSignalType: 'myrspoven_ds',
    onThreshold: [0.9, 1.0],
    offThreshold: [0.0, 0.2],
    temperatureRange: [minTemp, maxTemp],
    hourRange: [0, 24],
    minSamplesThreshold: 30,
    onStartDate: startDate,
    onEndDate: endDate,
    offStartDate: startDate,
    offEndDate: endDate,
  }
}

