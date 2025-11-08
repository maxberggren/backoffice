import { type AIAnalysisDataRow, type TemperatureBin } from '../data/schema'

export function createTemperatureBin(temperature: number): number {
  return Math.floor(temperature / 2) * 2
}

// Optimized percentile calculation
function getPercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0
  const index = Math.floor(sorted.length * percentile)
  return sorted[Math.min(index, sorted.length - 1)]
}

export function calculateBinStats(
  data: AIAnalysisDataRow[],
  signalName: string,
  minSamples: number
): Map<number, TemperatureBin> {
  if (data.length === 0) return new Map()
  
  const bins = new Map<number, { on: number[]; off: number[] }>()

  // Group data by temperature bin and control state (optimized)
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row.t === null) continue
    const signalValue = row[signalName] as number | null
    if (signalValue === null || isNaN(signalValue)) continue

    const bin = createTemperatureBin(row.t)
    let binData = bins.get(bin)
    if (!binData) {
      binData = { on: [], off: [] }
      bins.set(bin, binData)
    }

    if (row.control_state === 1) {
      binData.on.push(signalValue)
    } else {
      binData.off.push(signalValue)
    }
  }

  // Calculate statistics for each bin
  const result = new Map<number, TemperatureBin>()
  for (const [bin, values] of bins.entries()) {
    const onValues = values.on.length > 0 ? [...values.on].sort((a, b) => a - b) : []
    const offValues = values.off.length > 0 ? [...values.off].sort((a, b) => a - b) : []

    const onMean = onValues.length > 0 
      ? onValues.reduce((a, b) => a + b, 0) / onValues.length 
      : 0
    const offMean = offValues.length > 0 
      ? offValues.reduce((a, b) => a + b, 0) / offValues.length 
      : 0

    const onP25 = getPercentile(onValues, 0.025)
    const onP975 = getPercentile(onValues, 0.975)
    const offP25 = getPercentile(offValues, 0.025)
    const offP975 = getPercentile(offValues, 0.975)

    const isReliable = onValues.length >= minSamples && offValues.length >= minSamples

    result.set(bin, {
      bin,
      onMean,
      onCount: onValues.length,
      onP25,
      onP975,
      offMean,
      offCount: offValues.length,
      offP25,
      offP975,
      isReliable,
    })
  }

  return result
}

export function findReliableBins(
  bins: Map<number, TemperatureBin>,
  _minSamples: number
): number[] {
  return Array.from(bins.values())
    .filter((bin) => bin.isReliable)
    .map((bin) => bin.bin)
}

export function findOverlapBins(
  onBins: number[],
  offBins: number[]
): number[] {
  const offSet = new Set(offBins)
  return onBins.filter((bin) => offSet.has(bin))
}

