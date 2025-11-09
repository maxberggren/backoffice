import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationBlueprints } from '@/features/configuration/blueprints'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/blueprints')({
  component: ConfigurationBlueprints,
})
