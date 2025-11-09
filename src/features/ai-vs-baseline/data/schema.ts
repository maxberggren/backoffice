export interface AIVsBaselineConfig {
  startDate: Date | null
  endDate: Date | null
  selectedVariable: string | null
}

export interface TimeSeriesPoint {
  timestamp: string
  signal: number | null
  signalMin: number | null
  signalMax: number | null
  baseline: number | null
  isAIOffline?: boolean
}

export interface OfflinePeriod {
  start: string
  end: string
}


