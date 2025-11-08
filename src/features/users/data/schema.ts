import { z } from 'zod'

const buildingStatusSchema = z.union([
  z.literal('operational'),
  z.literal('maintenance'),
  z.literal('offline'),
  z.literal('warning'),
])
export type BuildingStatus = z.infer<typeof buildingStatusSchema>

const buildingTypeSchema = z.union([
  z.literal('office'),
  z.literal('residential'),
  z.literal('retail'),
  z.literal('industrial'),
])

const buildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  company: z.string(),
  type: buildingTypeSchema,
  status: buildingStatusSchema,
  temperature: z.number(),
  targetTemperature: z.number(),
  humidity: z.number(),
  energyUsage: z.number(),
  floors: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Building = z.infer<typeof buildingSchema>

export const buildingListSchema = z.array(buildingSchema)

// Keep old exports for backward compatibility during transition
export type UserStatus = BuildingStatus
export type User = Building
export const userListSchema = buildingListSchema
