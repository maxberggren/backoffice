import { ComfortSchedule, ScheduleInterval } from './schema'

// Sample intervals for "Emporio opening hours"
const sampleIntervals: ScheduleInterval[] = [
  // Night hours: 00:00-08:00 daily
  ...(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => ({
    id: `night-${day}`,
    day,
    startTime: '00:00',
    durationHours: 8,
    durationMinutes: 0,
    temperatureLowering: 5,
    ahuPressure: 30,
    ahuTemperature: 18,
  })),
  // Evening hours: 17:00-00:00 (7 hours) daily
  ...(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => ({
    id: `evening-${day}`,
    day,
    startTime: '17:00',
    durationHours: 7,
    durationMinutes: 0,
    temperatureLowering: 3,
    ahuPressure: 40,
    ahuTemperature: 20,
  })),
]

export const defaultSchedule: ComfortSchedule = {
  id: 'schedule-1',
  name: 'Emporio opening hours',
  fromDate: new Date('2025-04-15'),
  toDate: new Date('2030-04-16'),
  isActive: true,
  mode: 'manual',
  intervals: sampleIntervals,
}

// Simple hash function for deterministic "random" values
function hash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Generate deterministic pseudo-random value between 0 and 1
function seededRandom(seed: string): number {
  const h = hash(seed)
  return (h % 1000) / 1000
}

// Generate multiple noise values for more variation
function getNoise(seed: string, count: number = 3): number[] {
  const noises: number[] = []
  for (let i = 0; i < count; i++) {
    noises.push(seededRandom(`${seed}-noise-${i}`))
  }
  return noises
}

// Generate CO2 levels for visualization (proxy for occupancy)
export function getCO2Level(day: string, hour: number): number {
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day)
  const isWeekday = dayIndex < 5
  const isWorkHours = hour >= 8 && hour < 17
  
  // Create multiple seeds for different noise components
  const baseSeed = `${day}-${hour}`
  const hourlySeed = `${day}-hour-${hour}`
  const daySeed = `${day}`
  
  // Get multiple noise values
  const baseNoise = seededRandom(baseSeed)
  const hourlyNoise = seededRandom(hourlySeed)
  const dayNoise = seededRandom(daySeed)
  const fineNoise = seededRandom(`${baseSeed}-fine`)
  
  // Combine noises for more variation
  const combinedNoise = (baseNoise * 0.4 + hourlyNoise * 0.3 + dayNoise * 0.2 + fineNoise * 0.1)
  
  if (isWeekday && isWorkHours) {
    // Higher CO2 during work hours on weekdays (800-1200 ppm)
    // Peak around midday (12:00-14:00)
    const hourOffset = hour - 8
    const peakFactor = hour >= 12 && hour < 14 ? 1.2 : 1.0
    
    // Base level with gradual increase
    const baseLevel = 800 + (hourOffset * 30)
    
    // Add multiple noise components
    const hourlyVariation = (hourlyNoise - 0.5) * 80 // ±40 ppm variation
    const fineVariation = (fineNoise - 0.5) * 60 // ±30 ppm fine noise
    const dayVariation = (dayNoise - 0.5) * 50 // ±25 ppm day-to-day variation
    
    const totalNoise = hourlyVariation + fineVariation + dayVariation
    const level = baseLevel * peakFactor + totalNoise + (combinedNoise * 100)
    
    return Math.max(600, Math.min(level, 1300))
  }
  
  // Lower baseline during nights and weekends (~400 ppm)
  // Add more variation during off-hours too
  const baselineVariation = (baseNoise - 0.5) * 60 // ±30 ppm
  const hourlyVariation = (hourlyNoise - 0.5) * 40 // ±20 ppm
  const fineVariation = (fineNoise - 0.5) * 30 // ±15 ppm
  
  const level = 400 + baselineVariation + hourlyVariation + fineVariation
  
  return Math.max(350, Math.min(level, 500))
}

