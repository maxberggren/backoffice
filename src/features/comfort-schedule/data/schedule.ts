import type { ComfortSchedule, ScheduleInterval } from './schema'

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
    ahuTemperature: 3,
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
    // Use a value in the 1-5°C range
    ahuTemperature: 3,
  })),
]

export const defaultSchedule: ComfortSchedule = {
  id: 'schedule-1',
  name: 'Non-office hours',
  fromDate: new Date('2025-04-15'),
  toDate: new Date('2030-04-16'),
  isActive: true,
  mode: 'manual',
  intervals: sampleIntervals,
  ahuId: undefined, // undefined means "all AHUs"
}

// Mock AHU list - in a real app, this would come from an API
export const mockAHUs = [
  { id: 'ahu-1', name: 'AHU-1 (Main Floor)' },
  { id: 'ahu-2', name: 'AHU-2 (Second Floor)' },
  { id: 'ahu-3', name: 'AHU-3 (Third Floor)' },
  { id: 'ahu-4', name: 'AHU-4 (Basement)' },
]

// AHU operating hours - start and stop times per day
export interface AHUOperatingHours {
  ahuId: string
  [day: string]: string | { startTime: string; endTime: string }
}

export const mockAHUOperatingHours: AHUOperatingHours[] = [
  {
    ahuId: 'ahu-1',
    monday: { startTime: '08:00', endTime: '17:00' },
    tuesday: { startTime: '08:00', endTime: '17:00' },
    wednesday: { startTime: '08:00', endTime: '17:00' },
    thursday: { startTime: '08:00', endTime: '17:00' },
    friday: { startTime: '08:00', endTime: '17:00' },
    saturday: { startTime: '09:00', endTime: '15:00' },
    sunday: { startTime: '10:00', endTime: '14:00' },
  },
  {
    ahuId: 'ahu-2',
    monday: { startTime: '07:30', endTime: '18:00' },
    tuesday: { startTime: '07:30', endTime: '18:00' },
    wednesday: { startTime: '07:30', endTime: '18:00' },
    thursday: { startTime: '07:30', endTime: '18:00' },
    friday: { startTime: '07:30', endTime: '18:00' },
    saturday: { startTime: '08:00', endTime: '16:00' },
    sunday: { startTime: '09:00', endTime: '15:00' },
  },
  {
    ahuId: 'ahu-3',
    monday: { startTime: '08:15', endTime: '16:45' },
    tuesday: { startTime: '08:15', endTime: '16:45' },
    wednesday: { startTime: '08:15', endTime: '16:45' },
    thursday: { startTime: '08:15', endTime: '16:45' },
    friday: { startTime: '08:15', endTime: '16:45' },
    saturday: { startTime: '09:30', endTime: '14:30' },
    sunday: { startTime: '10:30', endTime: '13:30' },
  },
  {
    ahuId: 'ahu-4',
    monday: { startTime: '06:00', endTime: '20:00' },
    tuesday: { startTime: '06:00', endTime: '20:00' },
    wednesday: { startTime: '06:00', endTime: '20:00' },
    thursday: { startTime: '06:00', endTime: '20:00' },
    friday: { startTime: '06:00', endTime: '20:00' },
    saturday: { startTime: '07:00', endTime: '19:00' },
    sunday: { startTime: '08:00', endTime: '18:00' },
  },
]

// Color palette for AHU lines
const AHU_COLORS = [
  'rgb(239, 68, 68)',   // Red
  'rgb(59, 130, 246)',  // Blue
  'rgb(34, 197, 94)',   // Green
  'rgb(234, 179, 8)',   // Yellow
  'rgb(168, 85, 247)',  // Purple
  'rgb(236, 72, 153)',  // Pink
  'rgb(20, 184, 166)',  // Teal
  'rgb(251, 146, 60)',  // Orange
]

export function getAHUColor(ahuId: string): string {
  const index = mockAHUs.findIndex(ahu => ahu.id === ahuId)
  return index >= 0 ? AHU_COLORS[index % AHU_COLORS.length] : AHU_COLORS[0]
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

// Base CO2 pattern based on realistic daily occupancy pattern
// Pattern: Low night (440-450) -> gradual rise (05:00-08:00) -> peak (09:00-11:00, 13:00-15:00) -> decline (15:00-18:00) -> low evening (18:00-23:00)
// Weekends skip the midday peak (11:00-15:00)
function getBaseCO2Level(hour: number, isWeekend: boolean = false): number {
  // 00:00-05:00: Low and stable ~440-450 ppm
  if (hour >= 0 && hour < 5) {
    return 445
  }
  
  // 05:00-08:00: Gradual increase from ~445 to ~480
  if (hour >= 5 && hour < 8) {
    const progress = (hour - 5) / 3 // 0 to 1
    return 445 + (progress * 35) // 445 to 480
  }
  
  // 08:00-09:00: Significant rise (green line at 08:15), from ~480 to ~500
  if (hour >= 8 && hour < 9) {
    const progress = (hour - 8) / 1 // 0 to 1
    return 480 + (progress * 20) // 480 to 500
  }
  
  // 09:00-11:00: Continues climbing to peak ~500-510 ppm
  if (hour >= 9 && hour < 11) {
    const progress = (hour - 9) / 2 // 0 to 1
    return 500 + (progress * 10) // 500 to 510
  }
  
  // 11:00-13:00: Slight dip to ~480-490 ppm (weekdays) or stay low (weekends)
  if (hour >= 11 && hour < 13) {
    if (isWeekend) {
      // Weekends: stay at lower level, gradually decrease from ~480 to ~460
      const progress = (hour - 11) / 2 // 0 to 1
      return 480 - (progress * 20) // 480 to 460
    } else {
      const progress = (hour - 11) / 2 // 0 to 1
      return 510 - (progress * 20) // 510 to 490
    }
  }
  
  // 13:00-15:00: Rise again to second peak ~500-510 ppm (weekdays) or stay low (weekends)
  if (hour >= 13 && hour < 15) {
    if (isWeekend) {
      // Weekends: continue at lower level ~460-470
      const progress = (hour - 13) / 2 // 0 to 1
      return 460 + (progress * 10) // 460 to 470
    } else {
      const progress = (hour - 13) / 2 // 0 to 1
      return 490 + (progress * 20) // 490 to 510
    }
  }
  
  // 15:00-16:00: Red line at 15:15 marks decrease, drops to ~480-490 ppm (weekdays) or continue low (weekends)
  if (hour >= 15 && hour < 16) {
    if (isWeekend) {
      // Weekends: continue decreasing
      const progress = (hour - 15) / 1 // 0 to 1
      return 470 - (progress * 20) // 470 to 450
    } else {
      const progress = (hour - 15) / 1 // 0 to 1
      return 510 - (progress * 20) // 510 to 490
    }
  }
  
  // 16:00-18:00: Steady decrease to ~450 ppm
  if (hour >= 16 && hour < 18) {
    const progress = (hour - 16) / 2 // 0 to 1
    if (isWeekend) {
      return 450 - (progress * 5) // 450 to 445
    } else {
      return 490 - (progress * 40) // 490 to 450
    }
  }
  
  // 18:00-23:00: Low and stable ~440-450 ppm
  if (hour >= 18 && hour < 23) {
    return 445
  }
  
  // 23:00-24:00: Transition back to night levels
  return 445
}

// Generate CO2 levels for visualization (proxy for occupancy)
export function getCO2Level(day: string, hour: number): number {
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day)
  const isWeekday = dayIndex < 5
  
  // Get base level from realistic pattern (weekends skip midday peak)
  const baseLevel = getBaseCO2Level(hour, !isWeekday)
  
  // Create multiple seeds for variation
  const baseSeed = `${day}-${hour.toFixed(2)}`
  const minuteSeed = `${day}-${Math.floor(hour * 4)}` // For 15-minute resolution
  const daySeed = `${day}`
  
  // Get noise values for small variations
  const baseNoise = seededRandom(baseSeed)
  const minuteNoise = seededRandom(minuteSeed)
  const dayNoise = seededRandom(daySeed)
  
  // Add small variations (±5-10 ppm) to make it realistic but close to the base pattern
  const variation = (baseNoise - 0.5) * 10 + (minuteNoise - 0.5) * 5 + (dayNoise - 0.5) * 3
  
  const level = baseLevel + variation
  
  // Clamp to reasonable bounds
  return Math.max(400, Math.min(level, 520))
}

