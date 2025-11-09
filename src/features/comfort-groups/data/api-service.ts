import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { useAIAnalysisData } from '@/features/ai-analysis/data/api-service'
import { type ComfortGroupConfig, type GroupData, type TimeSeriesPoint, type GroupStats } from './schema'
import { transformToTimeSeries, filterByDateRange } from '../utils/group-calculations'
import { type AIAnalysisDataRow } from '@/features/ai-analysis/data/schema'

/**
 * Randomly split observables into 6 groups
 * Uses a deterministic seed based on signal names to ensure consistent grouping
 */
function getComfortGroups(availableSignals: string[]): GroupData[] {
  // Create a deterministic shuffle by sorting signals first, then using a simple hash
  // This ensures the same signals always produce the same groups
  const sorted = [...availableSignals].sort()
  
  // Simple hash function for deterministic shuffling
  const hash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }
  
  // Shuffle using seeded random based on signal names
  const shuffled = [...sorted]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const seed = hash(shuffled[i] + shuffled[0])
    const j = Math.abs(seed) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Split into 6 groups
  const groupSize = Math.ceil(shuffled.length / 6)
  const groups: GroupData[] = []
  
  for (let i = 0; i < 6; i++) {
    const start = i * groupSize
    const end = Math.min(start + groupSize, shuffled.length)
    const signalNames = shuffled.slice(start, end)
    
    if (signalNames.length > 0) {
      groups.push({
        category: {
          id: `group_${i + 1}`,
          name: `Group ${i + 1}`,
          pattern: `Group ${i + 1}`,
        },
        signalNames,
        data: [],
      })
    }
  }
  
  return groups
}

/**
 * Calculate group statistics
 */
function calculateGroupStats(
  timeSeriesData: TimeSeriesPoint[],
  groups: GroupData[]
): GroupStats[] {
  return groups.map((group) => {
    const categoryName = group.category.name
    const values = timeSeriesData
      .map((point) => point[categoryName] as number | null)
      .filter((v): v is number => v !== null && !isNaN(v))

    if (values.length === 0) {
      return {
        categoryId: group.category.id,
        categoryName,
        currentAverage: null,
        minValue: null,
        maxValue: null,
        dataPointCount: 0,
      }
    }

    const currentAverage = values[values.length - 1] // Most recent value
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    return {
      categoryId: group.category.id,
      categoryName,
      currentAverage,
      minValue,
      maxValue,
      dataPointCount: values.length,
    }
  })
}

/**
 * Calculate overall statistics across all groups
 */
function calculateOverallStats(
  timeSeriesData: TimeSeriesPoint[],
  groups: GroupData[]
): {
  overallAverage: (number | null)[]
  minAverage: (number | null)[]
  maxAverage: (number | null)[]
} {
  const overallAverage: (number | null)[] = []
  const minAverage: (number | null)[] = []
  const maxAverage: (number | null)[] = []

  for (const point of timeSeriesData) {
    const groupValues: number[] = []

    for (const group of groups) {
      const value = point[group.category.name] as number | null
      if (value !== null && !isNaN(value)) {
        groupValues.push(value)
      }
    }

    if (groupValues.length > 0) {
      // Overall average
      const avg = groupValues.reduce((a, b) => a + b, 0) / groupValues.length
      overallAverage.push(avg)

      // For min/max averages, we need to calculate per-group min/max first
      // For now, we'll use the min/max of all values at this timestamp
      // But ideally we'd want min/max per group, then average those
      const min = Math.min(...groupValues)
      const max = Math.max(...groupValues)
      minAverage.push(min)
      maxAverage.push(max)
    } else {
      overallAverage.push(null)
      minAverage.push(null)
      maxAverage.push(null)
    }
  }

  return { overallAverage, minAverage, maxAverage }
}

/**
 * Hook to get comfort groups data
 */
export function useComfortGroups(config: ComfortGroupConfig) {
  const { data: rawData } = useAIAnalysisData()

  return useQuery({
    queryKey: ['comfort-groups', config],
    queryFn: () => {
      if (!rawData || rawData.length === 0) {
        return {
          groups: [] as GroupData[],
          timeSeriesData: [] as TimeSeriesPoint[],
          stats: [] as GroupStats[],
        }
      }

      // Get available signals - only temperature (GT) observables
      const availableSignals = Object.keys(rawData[0]).filter(
        (key) => 
          !['timestamp', 'control_state', 't', 'MYRSPOVEN_DS'].includes(key) &&
          key.includes('_GT')
      )

      // Get comfort groups
      const groups = getComfortGroups(availableSignals)

      // Transform to time-series format
      let timeSeriesData = transformToTimeSeries(rawData, groups)

      // Apply date range filter
      if (config.startDate && config.endDate) {
        timeSeriesData = filterByDateRange(timeSeriesData, config.startDate, config.endDate)
      }

      // Calculate statistics
      const stats = calculateGroupStats(timeSeriesData, groups)
      const overallStats = calculateOverallStats(timeSeriesData, groups)

      // Add overall stats to time series data
      const enrichedTimeSeriesData = timeSeriesData.map((point, index) => ({
        ...point,
        overallAverage: overallStats.overallAverage[index],
        minAverage: overallStats.minAverage[index],
        maxAverage: overallStats.maxAverage[index],
      }))

      return {
        groups,
        timeSeriesData: enrichedTimeSeriesData,
        stats,
      }
    },
    enabled: !!rawData,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}

/**
 * Get default config based on available data
 */
export function getDefaultComfortGroupConfig(data: AIAnalysisDataRow[] | undefined): ComfortGroupConfig {
  const now = new Date()
  const endDate = data && data.length > 0 ? new Date(data[data.length - 1].timestamp) : now
  const startDate = subDays(endDate, 11) // Default to last 11 days

  return {
    startDate,
    endDate,
  }
}

