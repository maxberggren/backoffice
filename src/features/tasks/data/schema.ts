import { z } from 'zod'

// Alert/Maintenance Task schema for HVAC systems
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(), // open, in-progress, resolved
  label: z.string(),  // maintenance, temperature, energy, system-error
  priority: z.string(), // low, medium, high, critical
  building: z.string().optional(), // Building name
  location: z.string().optional(), // Specific location within building
  createdAt: z.coerce.date().optional(),
})

export type Task = z.infer<typeof taskSchema>
