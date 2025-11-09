import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationFeatures } from '@/features/configuration/features'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/features')({
  component: ConfigurationFeatures,
})
