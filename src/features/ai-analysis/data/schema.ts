export type ControlState = 0 | 1

export interface AIAnalysisDataRow {
  timestamp: string
  control_state: ControlState
  t: number | null // Outdoor temperature
  MYRSPOVEN_DS: number | null
  [signalName: string]: string | number | null
}

export interface AnalysisConfig {
  controlSignalType: 'myrspoven_ds' | 'split_by_dates'
  onThreshold: [number, number]
  offThreshold: [number, number]
  temperatureRange: [number, number]
  hourRange: [number, number]
  minSamplesThreshold: number
  onStartDate: Date | null
  onEndDate: Date | null
  offStartDate: Date | null
  offEndDate: Date | null
}

export interface TemperatureBin {
  bin: number // Center temperature (e.g., -10, -8, -6, etc.)
  onMean: number
  onCount: number
  onP25: number
  onP975: number
  offMean: number
  offCount: number
  offP25: number
  offP975: number
  isReliable: boolean // Has >= min_samples in both states
}

export interface DailyDistribution {
  date: string
  onCount: number
  offCount: number
}

export interface ImpactMetrics {
  simpleAverageDiff: number
  simpleAveragePctDiff: number
  weightedAverageDiff: number | null
  weightedAveragePctDiff: number | null
  uptime: number
  uptimeCorrectedDiff: number
  uptimeCorrectedPctDiff: number
  reliableBinsCount: number
}

export interface SavingsData {
  date: string
  actualSavings: number
  potentialSavings: number
  forfeitedSavings: number
  uptime: number
}

export interface SignalCategory {
  id: string
  name: string
  pattern: RegExp | string
  hasNormalization?: boolean
  hasAffinityLaw?: boolean
  hasTemperatureDiff?: boolean
}

export interface ScatterPoint {
  temperature: number
  signalValue: number
  controlState: ControlState
}

export interface SignalAvailability {
  date: string
  available: number
  missing: number
}

