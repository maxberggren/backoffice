import { type SignalCategory } from '@/features/ai-analysis/data/schema'

export interface TimeSeriesPoint {
  timestamp: string
  overallAverage?: number | null
  minAverage?: number | null
  maxAverage?: number | null
  [groupName: string]: string | number | null | undefined
}

export interface GroupData {
  category: SignalCategory
  signalNames: string[]
  data: TimeSeriesPoint[]
}

export interface ComfortGroupConfig {
  startDate: Date | null
  endDate: Date | null
}

export interface GroupStats {
  categoryId: string
  categoryName: string
  currentAverage: number | null
  minValue: number | null
  maxValue: number | null
  dataPointCount: number
}

