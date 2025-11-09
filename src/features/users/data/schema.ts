import { z } from 'zod'

const propertyStatusSchema = z.union([
  z.literal('operational'),
  z.literal('maintenance'),
  z.literal('offline'),
  z.literal('warning'),
])
export type PropertyStatus = z.infer<typeof propertyStatusSchema>

const propertyTypeSchema = z.union([
  z.literal('office'),
  z.literal('residential'),
  z.literal('retail'),
  z.literal('industrial'),
])

const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  company: z.string(),
  type: propertyTypeSchema,
  status: propertyStatusSchema,
  temperature: z.number(),
  targetTemperature: z.number(),
  humidity: z.number(),
  energyUsage: z.number(),
  floors: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Property = z.infer<typeof propertySchema>

export const propertyListSchema = z.array(propertySchema)

// Keep old exports for backward compatibility during transition
export type UserStatus = PropertyStatus
export type User = Property
export const userListSchema = propertyListSchema
