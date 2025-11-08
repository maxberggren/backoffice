import { z } from 'zod'

const processStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('error'),
  z.literal('pending'),
])

export type ProcessStatus = z.infer<typeof processStatusSchema>

const processViewerSchema = z.object({
  id: z.string(),
  building: z.string(),
  buildingId: z.string(),
  client: z.string(),
  country: z.string(),
  area: z.number().optional(), // squareMeters
  temperature: z.number().optional(),
  isOnline: z.boolean(),
  
  // Process states
  myrDs: processStatusSchema.optional(),
  myrD: processStatusSchema.optional(),
  spov: processStatusSchema.optional(),
  write: processStatusSchema.optional(),
  read: z.object({
    proMesOpe: processStatusSchema.optional(),
    smhWebProOpeMet: processStatusSchema.optional(),
    smhWebAirOpe: processStatusSchema.optional(),
    augOpe: processStatusSchema.optional(),
  }).optional(),
  train: processStatusSchema.optional(),
  hypOpt: processStatusSchema.optional(),
  discovery: processStatusSchema.optional(),
  maintenance: processStatusSchema.optional(),
  
  // Metrics
  uptime24H: z.number().optional(), // percentage
  rmse: z.object({
    value: z.number(),
    target: z.number(),
  }).optional(),
  since: z.string().optional(), // date string for offline status
  message: z.string().optional(),
  
  // Additional fields from select dropdown
  adaptiveMin: z.number().optional(),
  adaptiveMax: z.number().optional(),
  hasClimateBaseline: z.boolean().optional(),
  hasReadWriteDiscrepancies: z.boolean().optional(),
  hasZoneAssets: z.boolean().optional(),
  hasHeatingCircuit: z.boolean().optional(),
  hasVentilation: z.boolean().optional(),
  missingVSGTOVConnections: z.boolean().optional(),
  missingLBGPOVConnections: z.boolean().optional(),
  missingLBGTOVConnections: z.boolean().optional(),
  savingEnergy: z.boolean().optional(),
  automaticComfortScheduleActive: z.boolean().optional(),
  manualComfortScheduleActive: z.boolean().optional(),
  componentsErrors: z.number().optional(),
  modelTrainingTestR2Score: z.number().optional(),
  hasDistrictHeatingMeter: z.boolean().optional(),
  hasDistrictCoolingMeter: z.boolean().optional(),
  hasElectricityMeter: z.boolean().optional(),
  lastWeekUptime: z.number().optional(), // percentage
})

export type ProcessViewerBuilding = z.infer<typeof processViewerSchema>

export const processViewerListSchema = z.array(processViewerSchema)


