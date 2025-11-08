import { z } from 'zod'

export const operatingModeSchema = z.enum(['manual', 'automatic', 'off'])

export type OperatingMode = z.infer<typeof operatingModeSchema>

export const dayOfWeekSchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

export type DayOfWeek = z.infer<typeof dayOfWeekSchema>

export const scheduleIntervalSchema = z.object({
  id: z.string(),
  day: dayOfWeekSchema,
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  durationHours: z.number().min(0).max(23),
  durationMinutes: z.number().min(0).max(59),
  temperatureLowering: z.number().min(0).max(10), // degrees Celsius allowed to lower
  ahuPressure: z.number().min(0).max(100), // percentage
  ahuTemperature: z.number().min(-10).max(40), // Celsius
})

export type ScheduleInterval = z.infer<typeof scheduleIntervalSchema>

export const comfortScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  fromDate: z.date(),
  toDate: z.date(),
  isActive: z.boolean(),
  mode: operatingModeSchema,
  intervals: z.array(scheduleIntervalSchema),
  ahuId: z.string().optional(), // undefined means "all AHUs", string means specific AHU
})

export type ComfortSchedule = z.infer<typeof comfortScheduleSchema>

// Schema for managing multiple schedules (one per AHU or one for all)
export const ahuScheduleManagerSchema = z.object({
  schedules: z.array(comfortScheduleSchema),
  defaultScheduleId: z.string().optional(), // ID of the "all AHUs" schedule
})

export type AHUScheduleManager = z.infer<typeof ahuScheduleManagerSchema>

